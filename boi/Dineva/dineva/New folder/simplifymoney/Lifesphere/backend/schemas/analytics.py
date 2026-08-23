import datetime
from typing import Dict, List, Optional
from pydantic import BaseModel
from decimal import Decimal

class MonthlySpendItem(BaseModel):
    month: str # Format: YYYY-MM
    total_spent: Decimal

class CategorySpendItem(BaseModel):
    category: str
    amount: Decimal
    percentage: float

class ExpenseTrendItem(BaseModel):
    month: str
    electricity_amount: Optional[Decimal] = None
    water_amount: Optional[Decimal] = None
    shopping_amount: Optional[Decimal] = None
    other_amount: Optional[Decimal] = None

class RecurringPaymentItem(BaseModel):
    vendor: str
    average_amount: Decimal
    frequency_months: int
    last_payment_date: datetime.date

class LargestExpenseItem(BaseModel):
    document_id: str
    title: str
    vendor: Optional[str]
    amount: Decimal
    date: datetime.date

class WarrantyOverviewItem(BaseModel):
    document_id: str
    title: str
    product_name: str
    purchase_date: datetime.date
    expiry_date: datetime.date
    days_remaining: int

class DashboardAnalyticsResponse(BaseModel):
    monthly_spending: List[MonthlySpendItem]
    category_spending: List[CategorySpendItem]
    expense_trends: List[ExpenseTrendItem]
    recurring_payments: List[RecurringPaymentItem]
    largest_expenses: List[LargestExpenseItem]
    warranties: List[WarrantyOverviewItem]
    travel_count_last_year: int
    medical_records_count: int
