import SettingService from "../services/SettingService.js";
import SettingRepository from "../repository/SettingRepository.js";
import { SettingSchema } from "../models/Setting.js";
import { NextResponse } from "next/server";

class SettingController {
  async getSetting(req, _res, conn, tenant) {
    try {
      const SettingModel = conn.models.Setting || conn.model("Setting", SettingSchema);
      const SettingRepo = new SettingRepository(SettingModel);
      const settingService = new SettingService(SettingRepo);
      const setting = await settingService.getSetting(tenant);
      return NextResponse.json({ success: true, setting }, { status: 200 });
    } catch (err) {
      return NextResponse.json({ success: false, message: err.message }, { status: 400 });
    }
  }

  async updateSetting(req, _res, body, conn, tenant) {
    try {
      const SettingModel = conn.models.Setting || conn.model("Setting", SettingSchema);
      const SettingRepo = new SettingRepository(SettingModel);
      const settingService = new SettingService(SettingRepo);
      const setting = await settingService.updateSetting(tenant, body);
      return NextResponse.json({ success: true, setting }, { status: 200 });
    } catch (err) {
      return NextResponse.json({ success: false, message: err.message }, { status: 400 });
    }
  }
}

const settingController = new SettingController();
export default settingController;
