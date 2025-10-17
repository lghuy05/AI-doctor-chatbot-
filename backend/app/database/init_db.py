from .database import engine, Base
from .models import User


def init_db():
    try:
        # Base.metadata.drop_all(bind=engine)
        # print("drop table")
        Base.metadata.create_all(bind=engine)
        print("📊 Tables created:")
        for table in Base.metadata.tables.keys():
            print(f"   - {table}")
    except Exception as e:
        print(f"❌ Error creating database tables: {e}")
        raise


if __name__ == "__main__":
    init_db()
