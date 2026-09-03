import type { FunctionComponent } from 'react';
import React from 'react';
import { usePermissionsTranslation } from '../providers/TranslationProvider';
import type {
  PermissionRequest,
  PermissionGroupMetadata,
  PermissionResponse,
} from '../utils/types';
import { Permission } from './Permission';

export type PermissionGroupProps = {
  metadata: PermissionGroupMetadata;
  initialSelections: Record<string, PermissionResponse>;
  currentSelections: Record<string, PermissionRequest>;
  onPermissionChange: (permissionId: string, isGranted: boolean) => void;
};

const PermissionGroup: FunctionComponent<PermissionGroupProps> = ({
  metadata,
  initialSelections,
  currentSelections,
  onPermissionChange,
}) => {
  const { translate } = usePermissionsTranslation();

  const visiblePermissions = metadata.permissions.filter(
    (perm) => perm.permissionId in initialSelections,
  );

  if (visiblePermissions.length === 0) {
    return null;
  }

  return (
    <li className='flex flex-col gap-small padding-bottom-small'>
      <div className='flex flex-row items-center gap-xsmall'>
        <div className='text-title-large content-emphasis'>
          {translate(`${metadata.groupId}.Label`)}
        </div>
      </div>
      <ul className='flex flex-col gap-large' style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {visiblePermissions.map((permission) => (
          <li key={permission.permissionId}>
            <Permission
              permissionId={permission.permissionId}
              isGranted={currentSelections[permission.permissionId].isGranted}
              isInherited={initialSelections[permission.permissionId].isInherited ?? false}
              localInheritance={permission.inheritsFrom?.find(
                (p) => currentSelections[p]?.isGranted,
              )}
              canEdit={initialSelections[permission.permissionId].canEdit}
              onChange={onPermissionChange}
            />
          </li>
        ))}
      </ul>
    </li>
  );
};

export { PermissionGroup };
