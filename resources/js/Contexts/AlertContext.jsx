import React, { createContext, useContext, useState, useCallback } from 'react';

const AlertContext = createContext();

export function useAlert() {
    return useContext(AlertContext);
}

export function AlertProvider({ children }) {
    const [alert, setAlert] = useState(null);

    const showAlert = useCallback((options) => {
        return new Promise((resolve) => {
            setAlert({
                ...options,
                onConfirm: () => {
                    setAlert(null);
                    resolve({ isConfirmed: true, dismiss: null });
                },
                onCancel: () => {
                    setAlert(null);
                    resolve({ isConfirmed: false, dismiss: 'cancel' });
                }
            });
            
            // Auto close for timer
            if (options.timer) {
                setTimeout(() => {
                    setAlert(null);
                    resolve({ isConfirmed: false, dismiss: 'timer' });
                }, options.timer);
            }
        });
    }, []);

    return (
        <AlertContext.Provider value={{ showAlert }}>
            {children}
            
            {/* Overlay and Modal */}
            {alert && (
                <div className="fixed inset-0 z-[9999] flex items-end justify-center sm:items-center">
                    <div 
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
                        onClick={alert.onCancel}
                    ></div>
                    
                    <div className="bg-white w-full max-w-md mx-auto rounded-t-3xl sm:rounded-2xl p-6 relative z-10 animate-slide-up shadow-2xl pb-[max(20px,env(safe-area-inset-bottom))]">
                        {/* Drag Handle */}
                        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6 sm:hidden"></div>
                        
                        {alert.icon === 'success' && <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4"><svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg></div>}
                        {alert.icon === 'error' && <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4"><svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></div>}
                        {alert.icon === 'warning' && <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4"><svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg></div>}
                        {alert.icon === 'info' && <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4"><svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>}
                        {alert.icon === 'question' && <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 mb-4"><svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>}
                        
                        <h3 className="text-xl leading-6 font-extrabold text-gray-900 text-center mb-2">{alert.title}</h3>
                        {alert.html ? (
                            <div className="text-sm text-gray-500 text-center mb-8" dangerouslySetInnerHTML={{ __html: alert.html }}></div>
                        ) : (
                            <p className="text-sm text-gray-500 text-center mb-8">{alert.text}</p>
                        )}
                        
                        <div className="flex flex-col gap-3">
                            {alert.showConfirmButton !== false && (
                                <button
                                    type="button"
                                    className="w-full inline-flex justify-center rounded-xl border border-transparent px-4 py-3.5 text-base font-bold text-white shadow-sm hover:opacity-90 focus:outline-none"
                                    onClick={alert.onConfirm}
                                    style={{ backgroundColor: alert.confirmButtonColor || '#3b82f6' }}
                                >
                                    {alert.confirmButtonText || 'OK'}
                                </button>
                            )}
                            {alert.showCancelButton && (
                                <button
                                    type="button"
                                    className="w-full inline-flex justify-center rounded-xl border px-4 py-3.5 text-base font-bold shadow-sm hover:bg-gray-50 focus:outline-none"
                                    onClick={alert.onCancel}
                                    style={{ 
                                        backgroundColor: alert.cancelButtonColor || '#ffffff',
                                        color: alert.cancelButtonColor ? '#ffffff' : '#374151',
                                        borderColor: alert.cancelButtonColor ? alert.cancelButtonColor : '#d1d5db'
                                    }}
                                >
                                    {alert.cancelButtonText || 'Batal'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </AlertContext.Provider>
    );
}
