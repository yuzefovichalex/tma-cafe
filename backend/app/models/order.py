from pydantic import BaseModel

class OrderItem(BaseModel):
    id: str

class Order(BaseModel):
    items: list[OrderItem]