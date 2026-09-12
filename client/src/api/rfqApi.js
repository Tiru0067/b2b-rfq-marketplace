import api from './axios';

// --- Public & Supplier RFQ APIs ---

// Browse all available RFQs with optional search and location filters
export const fetchAvailableRfqs = async (params = {}) => {
  const response = await api.get('/rfqs', { params });
  return response.data;
};

// Get details for a single RFQ
export const fetchRfqDetails = async (id) => {
  const response = await api.get(`/rfqs/${id}`);
  return response.data;
};

// Submit a quotation for an RFQ (Supplier only)
export const submitQuotation = async (rfqId, data) => {
  const response = await api.post(`/rfqs/${rfqId}/quotations`, data);
  return response.data;
};

// Get all quotations submitted by the current supplier
export const fetchSupplierQuotations = async () => {
  const response = await api.get('/supplier/quotations');
  return response.data;
};

// --- Buyer RFQ APIs ---

// Get all RFQs created by the current buyer
export const fetchBuyerRfqs = async () => {
  const response = await api.get('/buyer/rfqs');
  return response.data;
};

// Get RFQ details along with all received supplier quotes (Buyer only)
export const fetchBuyerRfqDetails = async (id) => {
  const response = await api.get(`/buyer/rfqs/${id}`);
  return response.data;
};

// Create a new RFQ (Buyer only)
export const createRfq = async (data) => {
  const response = await api.post('/rfqs', data);
  return response.data;
};

// Update an existing RFQ (Buyer only)
export const updateRfq = async (id, data) => {
  const response = await api.put(`/rfqs/${id}`, data);
  return response.data;
};

// Change RFQ status between OPEN and CLOSED, with optional new deadline (Buyer only)
export const updateRfqStatus = async (id, status, deadline = null) => {
  const payload = { status, ...(deadline && { deadline }) };
  const response = await api.patch(`/rfqs/${id}/status`, payload);
  return response.data;
};

// Award RFQ to a specific quotation (Buyer only)
export const awardQuotation = async (rfqId, quoteId) => {
  const response = await api.patch(`/rfqs/${rfqId}/award/${quoteId}`);
  return response.data;
};
