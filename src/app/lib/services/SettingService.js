import SettingRepository from "../repository/SettingRepository.js";

class SettingService {
  constructor(settingRepository) {
    this.settingRepository = settingRepository;
  }

  async getSetting(tenant) {
    return await this.settingRepository.getSetting(tenant);
  }

  async updateSetting(tenant, data) {
    return await this.settingRepository.updateSetting(tenant, data);
  }
}

export default SettingService;
