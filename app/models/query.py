from sqlalchemy import Text, ForeignKey,JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.project import Project

class Query(Base):
    __tablename__ = "queries"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id", ondelete="CASCADE"))
    question: Mapped[str] = mapped_column(Text, nullable=False)
    answer: Mapped[str] = mapped_column(Text, nullable=False)
    project: Mapped["Project"] = relationship(back_populates="queries")
    sources: Mapped[list | None] = mapped_column(JSON, nullable=True, default=list)
