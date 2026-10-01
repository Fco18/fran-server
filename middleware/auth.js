const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verificar si el usuario está autenticado
exports.protect = async (req, res, next) => {
    try {
        // 1) Obtener el token
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No está autorizado para acceder a esta ruta'
            });
        }

        // 2) Verificar el token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 3) Verificar si el usuario aún existe
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'El usuario ya no existe'
            });
        }

        // 4) Verificar si el usuario cambió la contraseña después de que el token fue emitido
        if (user.changedPasswordAfter(decoded.iat)) {
            return res.status(401).json({
                success: false,
                message: 'La contraseña fue cambiada recientemente. Por favor inicie sesión nuevamente'
            });
        }

        // Otorgar acceso a la ruta protegida
        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Token inválido o expirado'
        });
    }
};

// Restringir acceso por roles
exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'No tiene permiso para realizar esta acción'
            });
        }
        next();
    };
}; 