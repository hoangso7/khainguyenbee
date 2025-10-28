import React from 'react';
import { Button } from './button';

const AlertDialog = ({ 
  open, 
  onOpenChange, 
  title, 
  description, 
  confirmText = "Xác nhận", 
  cancelText = "Hủy",
  onConfirm,
  variant = "default"
}) => {
  if (!open) return null;

  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50" 
        onClick={handleCancel}
      />
      
      {/* Dialog */}
      <div className="relative bg-white rounded-lg shadow-lg max-w-md w-full mx-4 p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {title}
            </h3>
            <p className="text-sm text-gray-600 mt-2">
              {description}
            </p>
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={handleCancel}
            >
              {cancelText}
            </Button>
            <Button
              onClick={handleConfirm}
              className={
                variant === "destructive" 
                  ? "bg-red-500 hover:bg-red-600 text-white" 
                  : "bg-blue-500 hover:bg-blue-600 text-white"
              }
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export { AlertDialog };
