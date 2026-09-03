import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import reportEvent from '../../services/reportEventService';
import { RootState } from '../../store';
import { getPageStateConstants } from './constants/textConstants';

import {
  IDVPage,
  PersonaTemplate,
  Recourse,
  ReportEvent,
  VerificationErrorCode,
  VerificationStatusCode,
  VerificationViewState
} from '../../enums';
import {
  getPersonaVerificationStatus,
  startPersonaIdVerification
} from './services/IDverificationAPI';

export interface VerificationStatus {
  sessionStatus: VerificationStatusCode;
  sessionErrorCode: VerificationErrorCode;
}

export interface VendorVerificationData {
  daysUntilNextVerification: number;
  sessionIdentifier: string;
  sessionToken: string;
  verificationLink: string;
  qrCode: string;
  loading: boolean;
}

const VendorVerificationDataInitialState: VendorVerificationData = {
  daysUntilNextVerification: 0,
  sessionIdentifier: null,
  sessionToken: null,
  verificationLink: null,
  qrCode: null,
  loading: false
};

export interface PageText {
  heading: string;
  bodyText: string[];
  icon: string;
  footerText: string;
  buttonText: string;
}

export interface IDVerificationState {
  page: IDVPage;
  vendorVerificationData: VendorVerificationData;
  loading: boolean;
  status: VerificationStatus;
  completionPageState: PageText;
  error: string | null;
  isAgeEstimation: boolean;
}

const IDVinitialState: IDVerificationState = {
  page: IDVPage.VendorLink,
  vendorVerificationData: VendorVerificationDataInitialState,
  loading: null,
  status: null,
  completionPageState: null,
  error: null,
  isAgeEstimation: false
};

export interface VerificationState {
  verified: boolean;
  IDVerificationState: IDVerificationState;
  loading: boolean;
}

const initialState: VerificationState = {
  verified: null,
  IDVerificationState: IDVinitialState,
  loading: null
};

export const selectIDVState = (state: RootState) => state.verification.IDVerificationState;
export const selectLoading = (state: RootState) => state.verification.loading;

export const startIDVerification = createAsyncThunk(
  'verification/startIDVerification',
  async (
    {
      ageEstimation,
      parentVerification = false,
      template
    }: { ageEstimation: boolean; parentVerification?: boolean; template?: PersonaTemplate },
    thunkAPI
  ) => {
    try {
      const response = (await startPersonaIdVerification(
        ageEstimation,
        parentVerification,
        template
      )) as VendorVerificationData;
      return response;
    } catch (error) {
      const recourseToReport = ageEstimation ? Recourse.AgeEstimation : Recourse.GovernmentId;
      reportEvent(ReportEvent.VerificationFailed, recourseToReport, {
        error: JSON.stringify(error)
      });
      return thunkAPI.rejectWithValue('Failed to start ID Verification');
    }
  }
);

export const fetchIDVerificationStatus = createAsyncThunk(
  'verification/fetchIDVerificationStatus',
  async (token: string, thunkAPI) => {
    try {
      const response = await getPersonaVerificationStatus(token);
      return response;
    } catch (error) {
      const state = thunkAPI.getState() as RootState;
      const { isAgeEstimation } = state.verification.IDVerificationState;
      const recourseToReport = isAgeEstimation ? Recourse.AgeEstimation : Recourse.GovernmentId;
      reportEvent(ReportEvent.VerificationFailed, recourseToReport, {
        error: JSON.stringify(error)
      });
      return thunkAPI.rejectWithValue('Failed to fetch ID Verification status');
    }
  }
);

export const verificationSlice = createSlice({
  name: 'verification',
  initialState,
  reducers: {
    resetVerificationStore: () => initialState,
    setVerified: (state, action: PayloadAction<boolean>) => {
      state.verified = action.payload;
    },
    setIDVerificationState: (state, action: PayloadAction<IDVerificationState>) => {
      state.IDVerificationState = { ...action.payload };
    },
    setIDVPage: (state, action: PayloadAction<IDVPage>) => {
      state.IDVerificationState.page = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    }
  },
  extraReducers: builder => {
    builder
      .addCase(startIDVerification.pending, (state, action) => {
        const { vendorVerificationData } = state.IDVerificationState;
        vendorVerificationData.loading = true;
        state.IDVerificationState = {
          ...state.IDVerificationState,
          vendorVerificationData,
          loading: true
        };
        state.loading = true;
      })
      .addCase(startIDVerification.fulfilled, (state, action) => {
        const vendorVerificationData = action.payload;
        const { daysUntilNextVerification } = vendorVerificationData;
        // Get ageEstimation from the thunk argument
        const { ageEstimation } = action.meta.arg;
        let completionPageState = null;
        let { page } = state.IDVerificationState;
        const isTempBanned = daysUntilNextVerification != null && daysUntilNextVerification > 0;
        vendorVerificationData.loading = false;
        if (isTempBanned) {
          // Cooldown applies to both FAE and IDV, so only show the generic
          // "verification declined" copy. The document-specific line is reserved
          // for genuine InvalidDocument failures in the IDV retry flow.
          completionPageState = getPageStateConstants(VerificationViewState.TEMP_BAN);
          page = IDVPage.Complete;
          // No vendor session is created in the cooldown case (sessionIdentifier
          // is null), so nothing downstream will clear the top-level spinner.
          state.loading = false;
        }
        state.IDVerificationState = {
          ...state.IDVerificationState,
          vendorVerificationData,
          completionPageState,
          page,
          loading: false,
          isAgeEstimation: ageEstimation
        };
      })
      .addCase(startIDVerification.rejected, (state, action) => {
        const { vendorVerificationData } = state.IDVerificationState;
        vendorVerificationData.loading = false;
        state.IDVerificationState = {
          ...state.IDVerificationState,
          vendorVerificationData,
          completionPageState: getPageStateConstants(VerificationViewState.ERROR),
          loading: false,
          error: action.error.message || 'Something went wrong'
        };
        state.loading = false;
      })
      .addCase(fetchIDVerificationStatus.pending, state => {
        state.IDVerificationState = {
          ...state.IDVerificationState,
          loading: true
        };
      })
      .addCase(fetchIDVerificationStatus.fulfilled, (state, action) => {
        const { isAgeEstimation } = state.IDVerificationState;
        // this FAE flow
        if (isAgeEstimation) {
          const vendorData = action.payload as VerificationStatus;
          state.IDVerificationState = {
            ...state.IDVerificationState,
            loading: false,
            status: vendorData
          };
        } else {
          // tHis is the regular IDV flow
          const vendorData = action.payload as VerificationStatus;
          let completionPageState;
          let { page } = state.IDVerificationState;
          switch (vendorData.sessionStatus) {
            case VerificationStatusCode.RequiresRetry:
            case VerificationStatusCode.Failure:
              page = IDVPage.Complete;
              switch (vendorData.sessionErrorCode) {
                case VerificationErrorCode.InvalidDocument:
                case VerificationErrorCode.BelowMinimumAge:
                  completionPageState = getPageStateConstants(VerificationViewState.FAILURE, [
                    'Label.FailedVerificationInvalidDocument'
                  ]);
                  break;
                case VerificationErrorCode.LowQualityMedia:
                case VerificationErrorCode.InvalidSelfie:
                  completionPageState = getPageStateConstants(VerificationViewState.FAILURE, [
                    'Label.FailedVerificationLowQuality'
                  ]);
                  break;
                case VerificationErrorCode.DocumentUnsupported:
                  completionPageState = getPageStateConstants(VerificationViewState.FAILURE, [
                    'Label.FailedVerificationUnsupportedDocument'
                  ]);
                  break;
                default:
                  completionPageState = getPageStateConstants(VerificationViewState.FAILURE);
                  break;
              }
              break;
            case VerificationStatusCode.RequiresManualReview:
              page = IDVPage.Complete;
              completionPageState = getPageStateConstants(VerificationViewState.PENDING);
              break;
            case VerificationStatusCode.Success:
            case VerificationStatusCode.Stored:
              page = IDVPage.Complete;
              completionPageState = getPageStateConstants(VerificationViewState.SUCCESS_GENERIC);
              break;
            case VerificationStatusCode.Started:
              page = IDVPage.Checklist;
              reportEvent(ReportEvent.VerificationStarted, Recourse.GovernmentId, {
                session: state.IDVerificationState.vendorVerificationData.sessionIdentifier
              });
              break;
            case VerificationStatusCode.Submitted:
              reportEvent(ReportEvent.verificationInProgress, Recourse.GovernmentId, {
                session: state.IDVerificationState.vendorVerificationData.sessionIdentifier
              });
              break;
            default:
          }
          state.IDVerificationState = {
            ...state.IDVerificationState,
            loading: false,
            status: vendorData,
            completionPageState,
            page
          };
        }
      })
      .addCase(fetchIDVerificationStatus.rejected, (state, action) => {
        state.IDVerificationState = {
          ...state.IDVerificationState,
          loading: false,
          error: action.error.message || 'Something went wrong'
        };
      });
  }
});

export const {
  resetVerificationStore,
  setVerified,
  setIDVerificationState,
  setIDVPage,
  setLoading
} = verificationSlice.actions;

export default verificationSlice.reducer;
