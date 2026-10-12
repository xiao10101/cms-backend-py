import asyncio
from contextvars import ContextVar

current_tenant = ContextVar[str | None]("current_tenant", default=None)

print(current_tenant.get()) # None
token = current_tenant.set("tenant_a")
print(current_tenant.get()) # 'tenant_a'
current_tenant.reset(token)
print(current_tenant.get()) # None


async def worker(name, tid):
    current_tenant.set(tid)
    await asyncio.sleep(0.1)
    print(f"{name} sees {current_tenant.get()}")

async def main():
    await asyncio.gather(
        worker("C", 3),
        worker("B", 2),
        worker("A", 1),
    )

asyncio.run(main())