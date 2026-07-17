# Smart Eco-Pharma Hub — API Contract

> **Audience:** Aya El-Hariry (Frontend Engineer)
> **Base URL:** `https://smart-eco-pharma.onrender.com` (production) or `http://localhost:8000` (development)
> **Authentication:** Supabase JWT token in the `Authorization` header as `Bearer <token>` for all endpoints except `/health`.

---

## Table of Contents

1. [Health Check](#1-health-check)
2. [Drug Catalogue — Inventory](#2-drug-catalogue--inventory)
3. [OTC Inventory](#3-otc-inventory)
4. [Drug Interactions](#4-drug-interactions)
5. [IoT Sensor Ingestion](#5-iot-sensor-ingestion)
6. [Pharmacovigilance](#6-pharmacovigilance)
7. [Error Response Format](#7-error-response-format)

---

## 1. Health Check

### `GET /health`

No authentication required.

| Field | Value |
|---|---|
| **Method** | `GET` |
| **Path** | `/health` |
| **Auth Required** | No |
| **Request Body** | None |
| **Response Schema** | `{ "status": str, "version": str, "environment": str }` |
| **Error Responses** | None |
| **Notes for Frontend** | Use for connection status indicator and startup health check. |

**Response Example (200):**

```json
{
  "status": "ok",
  "version": "0.1.0",
  "environment": "production"
}
```

---

## 2. Drug Catalogue — Inventory

### `GET /api/v1/inventory/drugs`

| Field | Value |
|---|---|
| **Method** | `GET` |
| **Path** | `/api/v1/inventory/drugs` |
| **Auth Required** | Yes |
| **Request Body** | None |
| **Response Schema** | `{ "drugs": DrugDetail[], "total": int, "limit": int, "offset": int }` |
| **Error Responses** | `401 Unauthorized`, `500 Internal Server Error` |
| **Notes for Frontend** | Paginated list. Use `limit` and `offset` query params for pagination. |

**Query Parameters:**

| Parameter | Type | Default | Description |
|---|---|---|---|
| `limit` | integer | 50 | Max items per page (max 200) |
| `offset` | integer | 0 | Pagination offset |
| `search` | string | null | Fuzzy search on `drug_name` and `brand_name` |

**Response Example (200):**

```json
{
  "drugs": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "drug_name": "Paracetamol",
      "brand_name": "Tylenol",
      "drug_class": "Analgesic",
      "regulatory_status": "otc",
      "dosage_forms": ["tablet", "syrup"],
      "active_ingredients": "Acetaminophen 500mg",
      "route_of_administration": "oral",
      "record_version": 1,
      "created_at": "2026-07-15T10:00:00Z",
      "updated_at": "2026-07-15T10:00:00Z",
      "deleted_at": null
    }
  ],
  "total": 1,
  "limit": 50,
  "offset": 0
}
```

---

### `GET /api/v1/inventory/drugs/{drug_id}`

| Field | Value |
|---|---|
| **Method** | `GET` |
| **Path** | `/api/v1/inventory/drugs/{drug_id}` |
| **Auth Required** | Yes |
| **Request Body** | None |
| **Response Schema** | `DrugDetail` |
| **Error Responses** | `401 Unauthorized`, `404 Not Found`, `500 Internal Server Error` |
| **Notes for Frontend** | `drug_id` is a UUID path parameter. |

**Response Example (200):**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "drug_name": "Paracetamol",
  "brand_name": "Tylenol",
  "drug_class": "Analgesic",
  "regulatory_status": "otc",
  "dosage_forms": ["tablet", "syrup"],
  "active_ingredients": "Acetaminophen 500mg",
  "route_of_administration": "oral",
  "record_version": 1,
  "created_at": "2026-07-15T10:00:00Z",
  "updated_at": "2026-07-15T10:00:00Z",
  "deleted_at": null
}
```

**Error Response Example (404):**

```json
{
  "error": "not_found",
  "detail": "Drug 550e8400-e29b-41d4-a716-446655440001 not found"
}
```

---

### `GET /api/v1/inventory/otc`

| Field | Value |
|---|---|
| **Method** | `GET` |
| **Path** | `/api/v1/inventory/otc` |
| **Auth Required** | Yes |
| **Request Body** | None |
| **Response Schema** | `{ "inventory": OTCInventoryDetail[], "total": int, "limit": int, "offset": int }` |
| **Error Responses** | `401 Unauthorized`, `500 Internal Server Error` |
| **Notes for Frontend** | Paginated list of OTC inventory records. |

**Query Parameters:**

| Parameter | Type | Default | Description |
|---|---|---|---|
| `limit` | integer | 50 | Max items per page (max 200) |
| `offset` | integer | 0 | Pagination offset |
| `reorder_status` | string | null | Filter: `normal`, `low`, `critical`, `on_order` |
| `storage_location_id` | string | null | Filter by storage location identifier |

**Response Example (200):**

```json
{
  "inventory": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440002",
      "drug_id": "550e8400-e29b-41d4-a716-446655440001",
      "stock_quantity": 200,
      "stock_unit": "tablets",
      "min_stock_threshold": 50,
      "reorder_quantity": 100,
      "max_storage_capacity": 500,
      "storage_location_identifier": "SHELF-A3",
      "storage_temp_min_c": 15.0,
      "storage_temp_max_c": 25.0,
      "storage_humidity_min_pct": 30.0,
      "storage_humidity_max_pct": 60.0,
      "batch_expiry_date": "2027-06-30",
      "supplier_ref": "PharmaCo-Egypt",
      "last_restocked_date": "2026-07-01",
      "reorder_status": "normal",
      "created_at": "2026-07-15T10:00:00Z",
      "updated_at": "2026-07-15T10:00:00Z"
    }
  ],
  "total": 1,
  "limit": 50,
  "offset": 0
}
```

---

### `GET /api/v1/inventory/otc/{inventory_id}`

| Field | Value |
|---|---|
| **Method** | `GET` |
| **Path** | `/api/v1/inventory/otc/{inventory_id}` |
| **Auth Required** | Yes |
| **Request Body** | None |
| **Response Schema** | `OTCInventoryDetail` |
| **Error Responses** | `401 Unauthorized`, `404 Not Found`, `500 Internal Server Error` |
| **Notes for Frontend** | `inventory_id` is a UUID path parameter. |

**Response Example (200):**

```json
{
  "id": "660e8400-e29b-41d4-a716-446655440002",
  "drug_id": "550e8400-e29b-41d4-a716-446655440001",
  "stock_quantity": 200,
  "stock_unit": "tablets",
  "min_stock_threshold": 50,
  "reorder_quantity": 100,
  "max_storage_capacity": 500,
  "storage_location_identifier": "SHELF-A3",
  "storage_temp_min_c": 15.0,
  "storage_temp_max_c": 25.0,
  "storage_humidity_min_pct": 30.0,
  "storage_humidity_max_pct": 60.0,
  "batch_expiry_date": "2027-06-30",
  "supplier_ref": "PharmaCo-Egypt",
  "last_restocked_date": "2026-07-01",
  "reorder_status": "normal",
  "created_at": "2026-07-15T10:00:00Z",
  "updated_at": "2026-07-15T10:00:00Z"
}
```

---

### `POST /api/v1/inventory/otc`

| Field | Value |
|---|---|
| **Method** | `POST` |
| **Path** | `/api/v1/inventory/otc` |
| **Auth Required** | Yes |
| **Request Body** | `OTCInventoryCreate` |
| **Response Schema** | `OTCInventoryDetail` (201) |
| **Error Responses** | `401 Unauthorized`, `422 Validation Error`, `500 Internal Server Error` |
| **Notes for Frontend** | Returns 201 on success. All required fields must be provided. |

**Request Body (JSON):**

```json
{
  "drug_id": "550e8400-e29b-41d4-a716-446655440001",
  "stock_quantity": 200,
  "stock_unit": "tablets",
  "min_stock_threshold": 50,
  "reorder_quantity": 100,
  "max_storage_capacity": 500,
  "storage_location_identifier": "SHELF-A3",
  "storage_temp_min_c": 15.0,
  "storage_temp_max_c": 25.0,
  "storage_humidity_min_pct": 30.0,
  "storage_humidity_max_pct": 60.0,
  "batch_expiry_date": "2027-06-30",
  "supplier_ref": "PharmaCo-Egypt",
  "last_restocked_date": "2026-07-01",
  "reorder_status": "normal"
}
```

**Required Fields:** `drug_id`, `stock_quantity`, `stock_unit`, `storage_location_identifier`, `reorder_status`

**Response Example (201):** Same as `OTCInventoryDetail` schema above.

---

### `PUT /api/v1/inventory/otc/{inventory_id}`

| Field | Value |
|---|---|
| **Method** | `PUT` |
| **Path** | `/api/v1/inventory/otc/{inventory_id}` |
| **Auth Required** | Yes |
| **Request Body** | `OTCInventoryUpdate` (partial update) |
| **Response Schema** | `OTCInventoryDetail` |
| **Error Responses** | `401 Unauthorized`, `404 Not Found`, `422 Validation Error`, `500 Internal Server Error` |
| **Notes for Frontend** | Only include fields you want to update. Unset fields remain unchanged. |

**Request Body (JSON) — example partial update:**

```json
{
  "stock_quantity": 150,
  "reorder_status": "low"
}
```

**Response Example (200):** Returns the full `OTCInventoryDetail` with updated fields.

---

### `PATCH /api/v1/inventory/otc/{inventory_id}/reorder-status`

| Field | Value |
|---|---|
| **Method** | `PATCH` |
| **Path** | `/api/v1/inventory/otc/{inventory_id}/reorder-status` |
| **Auth Required** | Yes |
| **Request Body** | `{ "reorder_status": str }` |
| **Response Schema** | `{ "id": UUID, "reorder_status": str, "updated_at": datetime }` |
| **Error Responses** | `401 Unauthorized`, `404 Not Found`, `422 Validation Error`, `500 Internal Server Error` |
| **Notes for Frontend** | Use this for quick reorder status changes without sending the full update payload. |

**Valid `reorder_status` values:** `normal`, `low`, `critical`, `on_order`

**Request Body (JSON):**

```json
{
  "reorder_status": "critical"
}
```

**Response Example (200):**

```json
{
  "id": "660e8400-e29b-41d4-a716-446655440002",
  "reorder_status": "critical",
  "updated_at": "2026-07-15T12:00:00Z"
}
```

---

### `DELETE /api/v1/inventory/drugs/{drug_id}`

| Field | Value |
|---|---|
| **Method** | `DELETE` |
| **Path** | `/api/v1/inventory/drugs/{drug_id}` |
| **Auth Required** | Yes |
| **Request Body** | None |
| **Response Schema** | Empty body (204) |
| **Error Responses** | `401 Unauthorized`, `404 Not Found`, `500 Internal Server Error` |
| **Notes for Frontend** | Soft-delete — sets `deleted_at`. Drug disappears from listings but data is preserved. |

**Response Example (204):** No body returned.

---

## 3. Drug Interactions

### `GET /api/v1/interactions`

| Field | Value |
|---|---|
| **Method** | `GET` |
| **Path** | `/api/v1/interactions` |
| **Auth Required** | Yes |
| **Request Body** | None |
| **Response Schema** | `{ "interactions": InteractionDetail[], "total": int, "limit": int, "offset": int }` |
| **Error Responses** | `401 Unauthorized`, `500 Internal Server Error` |
| **Notes for Frontend** | Paginated list. Filter by drug or risk grade. |

**Query Parameters:**

| Parameter | Type | Default | Description |
|---|---|---|---|
| `limit` | integer | 50 | Max items per page (max 200) |
| `offset` | integer | 0 | Pagination offset |
| `drug_id` | UUID | null | Filter interactions involving this drug |
| `risk_grade` | string | null | Filter by `grade_1_minimal`, `grade_2_moderate`, `grade_3_severe`, `grade_4_contraindicated` |

**Response Example (200):**

```json
{
  "interactions": [
    {
      "id": "770e8400-e29b-41d4-a716-446655440003",
      "drug_a_id": "550e8400-e29b-41d4-a716-446655440001",
      "drug_b_id": "550e8400-e29b-41d4-a716-446655440002",
      "interaction_type": "pharmacokinetic",
      "risk_grade": "grade_3_severe",
      "clinical_consequence": "Increased risk of GI bleeding.",
      "evidence_level": "established",
      "mechanism": "CYP2C9 inhibition",
      "management_recommendation": "Monitor INR closely.",
      "ai_generated": true,
      "gpt_model_version": "openai/gpt-4o",
      "source_reference": "DrugBank DB00316",
      "created_at": "2026-07-15T10:00:00Z",
      "updated_at": "2026-07-15T10:00:00Z"
    }
  ],
  "total": 1,
  "limit": 50,
  "offset": 0
}
```

---

### `GET /api/v1/interactions/{interaction_id}`

| Field | Value |
|---|---|
| **Method** | `GET` |
| **Path** | `/api/v1/interactions/{interaction_id}` |
| **Auth Required** | Yes |
| **Request Body** | None |
| **Response Schema** | `InteractionDetail` |
| **Error Responses** | `401 Unauthorized`, `404 Not Found`, `500 Internal Server Error` |
| **Notes for Frontend** | `interaction_id` is a UUID path parameter. |

**Response Example (200):** Single `InteractionDetail` object as shown above.

---

### `POST /api/v1/interactions/check`

| Field | Value |
|---|---|
| **Method** | `POST` |
| **Path** | `/api/v1/interactions/check` |
| **Auth Required** | Yes |
| **Request Body** | `{ "drug_ids": UUID[] }` |
| **Response Schema** | `{ "pairs": InteractionDetail[], "total_pairs_found": int }` |
| **Error Responses** | `401 Unauthorized`, `422 Validation Error`, `500 Internal Server Error` |
| **Notes for Frontend** | Send 2-10 drug UUIDs. Returns all known interactions between the pairs, sorted by risk grade (highest first). |

**Request Body (JSON):**

```json
{
  "drug_ids": [
    "550e8400-e29b-41d4-a716-446655440001",
    "550e8400-e29b-41d4-a716-446655440002",
    "550e8400-e29b-41d4-a716-446655440003"
  ]
}
```

**Response Example (200):**

```json
{
  "pairs": [
    {
      "id": "770e8400-e29b-41d4-a716-446655440003",
      "drug_a_id": "550e8400-e29b-41d4-a716-446655440001",
      "drug_b_id": "550e8400-e29b-41d4-a716-446655440002",
      "interaction_type": "pharmacokinetic",
      "risk_grade": "grade_3_severe",
      "clinical_consequence": "Increased risk of GI bleeding.",
      "evidence_level": "established",
      "mechanism": "CYP2C9 inhibition",
      "management_recommendation": "Monitor INR closely.",
      "ai_generated": true,
      "gpt_model_version": "openai/gpt-4o",
      "source_reference": null,
      "created_at": "2026-07-15T10:00:00Z",
      "updated_at": "2026-07-15T10:00:00Z"
    }
  ],
  "total_pairs_found": 1
}
```

**Empty Response Example (200):**

```json
{
  "pairs": [],
  "total_pairs_found": 0
}
```

---

## 4. IoT Sensor Ingestion

### `POST /api/v1/iot/readings`

| Field | Value |
|---|---|
| **Method** | `POST` |
| **Path** | `/api/v1/iot/readings` |
| **Auth Required** | Yes |
| **Request Body** | `IoTSensorReadingRequest` |
| **Response Schema** | `IoTIngestionResponse` (201) |
| **Error Responses** | `401 Unauthorized`, `422 Validation Error`, `500 Internal Server Error` |
| **Notes for Frontend** | Duplicates are accepted but flagged. Check `duplicate` field in response. |

**Request Body (JSON):**

```json
{
  "schema_version": "1.0",
  "reading_id": "880e8400-e29b-41d4-a716-446655440004",
  "device_id": "DEVICE-001",
  "storage_location_id": "SHELF-A3",
  "sequence_number": 42,
  "timestamp_utc": "2026-07-15T10:00:00Z",
  "transmission_mode": "batch",
  "sensor_payload": {
    "temperature_celsius": 22.5,
    "humidity_percent": 45.0,
    "inventory_trigger": false,
    "light_lux": 120.0,
    "door_open": false
  },
  "device_status": {
    "battery_level_percent": 85,
    "signal_quality": 90,
    "firmware_version": "2.1.0"
  },
  "alert_flags": {
    "temperature_out_of_range": false,
    "humidity_out_of_range": false,
    "inventory_threshold_breached": false
  }
}
```

**Response Example (201):**

```json
{
  "reading_id": "880e8400-e29b-41d4-a716-446655440004",
  "accepted": true,
  "duplicate": false,
  "alerts_triggered": []
}
```

**Duplicate Response Example (201):**

```json
{
  "reading_id": "880e8400-e29b-41d4-a716-446655440004",
  "accepted": false,
  "duplicate": true,
  "alerts_triggered": []
}
```

---

### `GET /api/v1/iot/readings`

| Field | Value |
|---|---|
| **Method** | `GET` |
| **Path** | `/api/v1/iot/readings` |
| **Auth Required** | Yes |
| **Request Body** | None |
| **Response Schema** | `{ "readings": IoTReadingDetail[], "total": int }` |
| **Error Responses** | `401 Unauthorized`, `500 Internal Server Error` |
| **Notes for Frontend** | Returns readings sorted by `timestamp_utc` descending (newest first). |

**Query Parameters:**

| Parameter | Type | Default | Description |
|---|---|---|---|
| `storage_location_id` | string | null | Filter by storage location |
| `from_timestamp` | string | null | ISO 8601 timestamp — only return readings after this time |
| `limit` | integer | 100 | Max items (max 1000) |

**Response Example (200):**

```json
{
  "readings": [
    {
      "id": "990e8400-e29b-41d4-a716-446655440005",
      "schema_version": "1.0",
      "reading_id": "880e8400-e29b-41d4-a716-446655440004",
      "device_id": "DEVICE-001",
      "storage_location_id": "SHELF-A3",
      "sequence_number": 42,
      "timestamp_utc": "2026-07-15T10:00:00Z",
      "transmission_mode": "batch",
      "sensor_payload": {
        "temperature_celsius": 22.5,
        "humidity_percent": 45.0,
        "inventory_trigger": false,
        "light_lux": 120.0,
        "door_open": false
      },
      "device_status": {
        "battery_level_percent": 85,
        "signal_quality": 90,
        "firmware_version": "2.1.0"
      },
      "alert_flags": {
        "temperature_out_of_range": false,
        "humidity_out_of_range": false,
        "inventory_threshold_breached": false
      },
      "received_at": "2026-07-15T10:00:01Z"
    }
  ],
  "total": 1
}
```

---

### `GET /api/v1/iot/alerts`

| Field | Value |
|---|---|
| **Method** | `GET` |
| **Path** | `/api/v1/iot/alerts` |
| **Auth Required** | Yes |
| **Request Body** | None |
| **Response Schema** | `{ "alerts": IoTAlertDetail[], "total": int }` |
| **Error Responses** | `401 Unauthorized`, `500 Internal Server Error` |
| **Notes for Frontend** | Returns only unacknowledged alerts, sorted by `created_at` descending. |

**Response Example (200):**

```json
{
  "alerts": [
    {
      "id": "aa0e8400-e29b-41d4-a716-446655440006",
      "reading_id": "880e8400-e29b-41d4-a716-446655440004",
      "alert_type": "temperature_out_of_range",
      "storage_location_id": "SHELF-A3",
      "acknowledged": false,
      "created_at": "2026-07-15T10:00:02Z"
    }
  ],
  "total": 1
}
```

---

## 5. Pharmacovigilance

### `POST /api/v1/pharmacovigilance/analyze`

| Field | Value |
|---|---|
| **Method** | `POST` |
| **Path** | `/api/v1/pharmacovigilance/analyze` |
| **Auth Required** | Yes |
| **Request Body** | `PVAnalysisRequest` |
| **Response Schema** | `PVAnalysisResponse` (200) |
| **Error Responses** | `401 Unauthorized`, `404 Not Found`, `422 Validation Error`, `500 Internal Server Error` |
| **Notes for Frontend** | Triggers GPT-4o analysis. May take 2-5 seconds. Returns persisted interaction record. |

**Request Body (JSON):**

```json
{
  "drug_a_id": "550e8400-e29b-41d4-a716-446655440001",
  "drug_b_id": "550e8400-e29b-41d4-a716-446655440002",
  "clinical_context": "Elderly patient on anticoagulation therapy with renal impairment"
}
```

**Required Fields:** `drug_a_id`, `drug_b_id`

**Response Example (200):**

```json
{
  "interaction_id": "770e8400-e29b-41d4-a716-446655440003",
  "risk_grade": "grade_3_severe",
  "clinical_consequence": "Significantly increased risk of major bleeding events.",
  "management_recommendation": "Avoid combination. If unavoidable, reduce warfarin dose by 25% and monitor INR weekly.",
  "evidence_level": "established",
  "ai_generated": true,
  "model_version": "openai/gpt-4o",
  "tokens_used": 350
}
```

---

### `GET /api/v1/pharmacovigilance/reports/{drug_id}`

| Field | Value |
|---|---|
| **Method** | `GET` |
| **Path** | `/api/v1/pharmacovigilance/reports/{drug_id}` |
| **Auth Required** | Yes |
| **Request Body** | None |
| **Response Schema** | `{ "reports": PVAnalysisResponse[], "drug_id": UUID }` |
| **Error Responses** | `401 Unauthorized`, `404 Not Found`, `500 Internal Server Error` |
| **Notes for Frontend** | Returns all AI-generated interaction reports for a given drug. Ordered by `created_at` descending. |

**Response Example (200):**

```json
{
  "reports": [
    {
      "interaction_id": "770e8400-e29b-41d4-a716-446655440003",
      "risk_grade": "grade_3_severe",
      "clinical_consequence": "Increased risk of GI bleeding.",
      "management_recommendation": "Monitor INR closely.",
      "evidence_level": "established",
      "ai_generated": true,
      "model_version": "openai/gpt-4o",
      "tokens_used": 0
    }
  ],
  "drug_id": "550e8400-e29b-41d4-a716-446655440001"
}
```

---

## 6. Error Response Format

All error responses follow a consistent structure:

```json
{
  "error": "<error_code>",
  "detail": "<human-readable description>"
}
```

**Error codes:**

| Code | HTTP Status | Meaning |
|---|---|---|
| `not_found` | 404 | Resource does not exist or has been soft-deleted |
| `validation_error` | 422 | Request body failed Pydantic validation |
| `internal_error` | 500 | Unexpected server error |

**Validation Error Detail Format (422):**

```json
{
  "error": "validation_error",
  "detail": [
    {
      "loc": ["body", "stock_quantity"],
      "msg": "Field required",
      "type": "value_error.missing"
    }
  ]
}
```

---

## 7. Enum Reference

| Enum | Allowed Values |
|---|---|
| `regulatory_status` | `prescription_only`, `otc`, `controlled` |
| `reorder_status` | `normal`, `low`, `critical`, `on_order` |
| `risk_grade` | `grade_1_minimal`, `grade_2_moderate`, `grade_3_severe`, `grade_4_contraindicated` |
| `evidence_level` | `established`, `theoretical`, `case_report` |

---

*Document version: 1.0 — July 2026*
*Project: Smart Eco-Pharma Hub*
*Prepared for: Aya El-Hariry (Frontend Engineer)*
