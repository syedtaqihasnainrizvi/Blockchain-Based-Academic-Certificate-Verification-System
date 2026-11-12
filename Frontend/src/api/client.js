import axios from 'axios';

const API_BASE = 'https://credchain-api-ncgc.onrender.com/api';

const client = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

export const getChain = () => client.get('/chain').then(r => r.data.data);
export const getValidators = () => client.get('/validators').then(r => r.data.data);
export const getPending = () => client.get('/pending').then(r => r.data.data);
export const issueCredential = (payload) => client.post('/issue', payload).then(r => r.data);
export const sealBlock = () => client.post('/seal-block').then(r => r.data);
export const verifyCredential = (certId) => client.get(`/verify/${encodeURIComponent(certId)}`).then(r => r.data.data);
export const tamperDemo = () => client.post('/tamper-demo').then(r => r.data);
export const toggleValidator = (nodeId) => client.post(`/validators/${nodeId}/toggle`).then(r => r.data.data);
export const resetChain = () => client.post('/reset').then(r => r.data);

export default client;