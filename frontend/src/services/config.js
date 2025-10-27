// Application configuration service
// This service provides application information that can be configured via environment variables

const getAppConfig = () => {
  // These values can be overridden by environment variables in production
  return {
    domain: process.env.REACT_APP_DOMAIN || 'khainguyenbee.io.vn',
    appName: process.env.REACT_APP_NAME || 'Quản lý tổ ong',
    version: process.env.REACT_APP_VERSION || '2.0.0',
    companyName: process.env.REACT_APP_COMPANY_NAME || 'KhaiNguyenBee'
  };
};

export default getAppConfig;
