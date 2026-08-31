from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.database.schema import User
from app.core.auth import get_password_hash

class AuthService:
    
    @staticmethod
    async def get_user_by_username(db: AsyncSession, username: str) -> User | None:
        result = await db.execute(select(User).where(User.username == username))
        return result.scalars().first()

    @staticmethod
    async def get_user_by_email(db: AsyncSession, email: str) -> User | None:
        result = await db.execute(select(User).where(User.email == email))
        return result.scalars().first()

    @staticmethod
    async def create_user(db: AsyncSession, username: str, email: str, password: str, role: str = "Investigator") -> User:
        hashed_password = get_password_hash(password)
        new_user = User(
            username=username,
            email=email,
            hashed_password=hashed_password,
            role=role
        )
        db.add(new_user)
        await db.commit()
        await db.refresh(new_user)
        return new_user
