import os
import shutil
from pathlib import Path

def main():
    base = Path("c:/Users/Guntass Kaur/New folder (19)/boi/backend/app")

    # Global Search and Replace for imports
    def replace_in_file(filepath, replacements):
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                content = f.read()
            for old, new in replacements.items():
                content = content.replace(old, new)
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(content)
        except Exception as e:
            print(f"Error replacing in {filepath}: {e}")

    replacements = {
        "from app.core.database import Base": "from app.database.postgres import Base",
        "from app.core.database import get_db": "from app.database.postgres import get_db",
        "from app.core.database import engine": "from app.database.postgres import engine",
        "from app.models.all_models import": "from app.database.schema import",
        "import app.models.all_models": "import app.database.schema",
        "from app.models import": "from app.database.schema import",
        "import app.models": "import app.database.schema",
        "app.ml.dataset_loader": "app.services.dataset_loader",
        "app.ml.graph_builder": "app.services.graph_engine",
        "app.services.fraud_scoring": "app.services.fraud_engine",
        "from app.api.routes import": "# from app.api.routes import"
    }

    for ext in ["*.py"]:
        for filepath in base.rglob(ext):
            replace_in_file(filepath, replacements)
            
    print("Refactor script complete.")

if __name__ == "__main__":
    main()
