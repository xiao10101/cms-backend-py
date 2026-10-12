import asyncio

from sqlalchemy import select

from app.core.security import hash_password
from app.db.session import async_session_factory
from app.models import Tenant, User

tenants_data = [
    {"name": "阿里巴巴集团", "code": "alibaba", "contact_name": "马云", "contact_email": "mayun@alibaba.com"},
    {"name": "腾讯科技", "code": "tencent", "contact_name": "马化腾", "contact_email": "penguin@tencent.com"},
    {"name": "百度在线", "code": "baidu", "contact_name": "李彦宏", "contact_email": "robin@baidu.com"},
    {"name": "字节跳动", "code": "bytedance", "contact_name": "张一鸣", "contact_email": "yiming@bytedance.com"},
    {"name": "华为技术", "code": "huawei", "contact_name": "任正非", "contact_email": "zhengfei@huawei.com"},
    {"name": "小米科技", "code": "xiaomi", "contact_name": "雷军", "contact_email": "leijun@xiaomi.com"},
    {"name": "京东集团", "code": "jd", "contact_name": "刘强东", "contact_email": "richard@jd.com"},
    {"name": "网易公司", "code": "netease", "contact_name": "丁磊", "contact_email": "dinglei@163.com"},
    {"name": "美团点评", "code": "meituan", "contact_name": "王兴", "contact_email": "wangxing@meituan.com"},
    {"name": "拼多多", "code": "pinduoduo", "contact_name": "黄峥", "contact_email": "huangzheng@pdd.com"},
]


async def main():
    async with async_session_factory() as session:
        for t in tenants_data:
            # 1. 查找或创建租户
            tenant = (
                await session.execute(select(Tenant).where(Tenant.code == t["code"]))
            ).scalar_one_or_none()

            if tenant is None:
                tenant = Tenant(
                    name=t["name"],
                    code=t["code"],
                    contact_email=t["contact_email"],
                    contact_name=t["contact_name"],
                )
                session.add(tenant)
                await session.flush()  # 获取 tenant.id

            # 2. 为该租户创建管理员用户（用户名：admin_{code}）
            admin_username = f"admin_{t['code']}"
            user = (
                await session.execute(
                    select(User).where(
                        User.username == admin_username,
                        User.tenant_id == tenant.id,
                    )
                )
            ).scalar_one_or_none()

            if user is None:
                user = User(
                    tenant_id=tenant.id,
                    username=admin_username,
                    name=t["contact_name"],
                    email=t["contact_email"],
                    password=hash_password("pwd123456"),  # 统一初始密码
                )
                session.add(user)

        await session.commit()
        print("成功插入 10 个租户和 10 个管理员用户。")


if __name__ == "__main__":
    asyncio.run(main())