from typing import List, Dict
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api.dependencies import get_db, require_permission
from app.models.setting import WebsiteSetting
from app.schemas.common import APIResponse
from app.schemas.setting import WebsiteSettingResponse, WebsiteSettingUpdate

router = APIRouter(prefix="/admin/settings", tags=["Admin Settings"])


@router.get("", response_model=APIResponse[List[WebsiteSettingResponse]], dependencies=[Depends(require_permission("settings.manage"))])
def get_settings(db: Session = Depends(get_db)):
    settings_list = db.query(WebsiteSetting).all()
    return APIResponse(data=[WebsiteSettingResponse.model_validate(s) for s in settings_list])


@router.put("/{key}", response_model=APIResponse[WebsiteSettingResponse], dependencies=[Depends(require_permission("settings.manage"))])
def update_setting(key: str, data: WebsiteSettingUpdate, db: Session = Depends(get_db)):
    setting = db.query(WebsiteSetting).filter(WebsiteSetting.key == key).first()
    if not setting:
        setting = WebsiteSetting(key=key, value=data.value, description=data.description)
        db.add(setting)
    else:
        setting.value = data.value
        if data.description:
            setting.description = data.description

    db.commit()
    db.refresh(setting)
    return APIResponse(message="Setting updated", data=WebsiteSettingResponse.model_validate(setting))


@router.get("/public/site-info", response_model=APIResponse[Dict[str, str]])
def get_public_site_info(db: Session = Depends(get_db)):
    settings_list = db.query(WebsiteSetting).all()
    data = {s.key: s.value for s in settings_list}
    return APIResponse(data=data)
