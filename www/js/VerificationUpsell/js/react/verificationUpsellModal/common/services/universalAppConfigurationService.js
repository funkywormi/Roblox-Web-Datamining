import { Guac } from 'Roblox';

export default function getSettingsUIPolicy() {
  return Guac.callBehaviour('account-settings-ui').catch(() => ({}));
}
