import SettingModel from "../models/Setting.js";

class SettingRepository {
  constructor(model = SettingModel) {
    this.model = model;
  }

  async getSetting(tenant) {
    return await this.model.findOne({ tenant });
  }

  async updateSetting(tenant, data) {
    return await this.model.findOneAndUpdate({ tenant }, data, { new: true, upsert: true });
  }
}

export default SettingRepository;
