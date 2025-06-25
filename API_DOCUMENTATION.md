# CartScan API Documentation

## Overview
This REST API provides endpoints for managing inventory and transactions for a retail shop scanner app. It includes endpoints for managing items, creating transactions, and tracking sales.

## Endpoints

### Items

#### List Items
```
GET /api/items
```
- **Parameters**:
  - `category` (optional): Filter items by category
  - `per_page` (optional, default: 15): Number of items per page

#### Get Item
```
GET /api/items/{serial_no}
```
- **Parameters**: None
- **Path Parameters**:
  - `serial_no`: Item serial number

#### Create Item
```
POST /api/items
```
- **Body**:
  ```json
  {
    "serial_no": "integer",
    "name": "string",
    "category": "string",
    "price": "numeric"
  }
  ```

#### Bulk Create Items
```
POST /api/items/bulk
```
- **Body**:
  ```json
  {
    "items": [
      {
        "serial_no": "integer",
        "name": "string",
        "category": "string",
        "price": "numeric"
      }
    ]
  }
  ```

#### Update Item
```
PUT /api/items/{serial_no}
```
- **Body**: Same as Create Item
- **Path Parameters**:
  - `serial_no`: Item serial number

#### Delete Item
```
DELETE /api/items/{serial_no}
```
- **Parameters**: None
- **Path Parameters**:
  - `serial_no`: Item serial number

### Transactions

#### List Transactions
```
GET /api/transactions
```
- **Parameters**:
  - `customer_number` (optional): Filter by customer number
  - `from` (optional): Start date (YYYY-MM-DD)
  - `to` (optional): End date (YYYY-MM-DD)
  - `min_total` (optional): Minimum total amount
  - `max_total` (optional): Maximum total amount
  - `per_page` (optional, default: 15): Number of transactions per page

#### Get Transaction
```
GET /api/transactions/{txd}
```
- **Parameters**: None
- **Path Parameters**:
  - `txd`: Transaction ID

#### Create Transaction
```
POST /api/transactions
```
- **Body**:
  ```json
  {
    "txd": "string",
    "customer_number": "string",
    "items": [
      {
        "serial_no": "integer",
        "quantity": "integer",
        "unit_price": "numeric"
      }
    ]
  }
  ```

## Response Format
All responses are in JSON format. For collections, the response includes pagination information.

## Error Handling
- **404**: Resource not found
- **422**: Validation errors
- **500**: Internal server error

## Example Usage

### Create a Transaction
```bash
curl -X POST http://cartscanapi/api/transactions \
-H "Content-Type: application/json" \
-d '{
    "txd": "TXD123",
    "customer_number": "CUST123",
    "items": [
        {
            "serial_no": 123,
            "quantity": 2,
            "unit_price": 1000
        }
    ]
}'
```

### Get Transaction Details
```bash
curl http://cartscanapi/api/transactions/TXD123
```
