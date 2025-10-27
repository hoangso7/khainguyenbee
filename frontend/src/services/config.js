// Application configuration service
export const getAppConfig = () => {
  return {
    domain: process.env.REACT_APP_DOMAIN || 'khainguyenbee.io.vn',
    appName: process.env.REACT_APP_NAME || 'Quản lý tổ ong',
    version: process.env.REACT_APP_VERSION || '2.0.0',
    companyName: process.env.REACT_APP_COMPANY_NAME || 'KhaiNguyenBee'
  };
};

export default getAppConfig;