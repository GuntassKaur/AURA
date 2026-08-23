import enum

class DocumentType(str, enum.Enum):
    INVOICE = "invoice"
    RECEIPT = "receipt"
    WARRANTY = "warranty"
    UTILITY_BILL = "utility_bill"
    OTHER = "other"

class UtilityType(str, enum.Enum):
    ELECTRICITY = "electricity"
    WATER = "water"
    GAS = "gas"
    INTERNET = "internet"
    OTHER = "other"

class ReminderType(str, enum.Enum):
    WARRANTY_EXPIRATION = "warranty_expiration"
    BILL_DUE = "bill_due"
    CUSTOM = "custom"

class ReminderStatus(str, enum.Enum):
    PENDING = "pending"
    TRIGGERED = "triggered"
    COMPLETED = "completed"
    SNOOZED = "snoozed"

class ProcessingStatus(str, enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
