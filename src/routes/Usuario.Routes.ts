// Importación de módulos externos y middlewares
import { Router } from "express";
import { body, param } from "express-validator";
import { authorizeAdmin } from "../middleware/authotizeAdmin";
// Controlador
import { UsuarioController } from "../controllers/UsuarioController";

// Middlewares personalizados
import { handleInputErrors } from "../middleware/validation";
import { upload } from '../middleware/uploadConfig';
import { validateUsuarioBody, validateUsuarioNoExiste, validateUsuarioId } from "../middleware/Usuario";
import { authenticate } from "../middleware/auth";

// Configuración
import { limiter } from "../config/limiter";

// Inicialización del enrutador
const UsuarioRouter = Router();

// Middleware global: Limitador de peticiones para prevenir ataques de fuerza bruta
UsuarioRouter.use(limiter);

/* ---------------------------------------------
   RUTAS DE USUARIOS
----------------------------------------------*/

// Obtener todos los usuarios
UsuarioRouter.get(
  "/",
  
  handleInputErrors,
  UsuarioController.getAll
);

// Obtener el perfil del usuario autenticado
UsuarioRouter.get(
  "/user",
  authenticate,
  UsuarioController.usertraer
);
UsuarioRouter.put('/:id', UsuarioController.actualizarTelefono);
// Obtener usuario por ID
UsuarioRouter.get(
  "/:id",
  authenticate, 
  validateUsuarioId,
  handleInputErrors,
  UsuarioController.getUsuarioId
);

// Crear un nuevo usuario
UsuarioRouter.post(
  "/",
  validateUsuarioNoExiste,
  validateUsuarioBody,
  handleInputErrors,
  UsuarioController.crearUsuario
);
UsuarioRouter.post(
  '/crear-usuario',
  upload.fields([
    { name: 'imagenUbicacion', maxCount: 1 },
    { name: 'imagenPerfil', maxCount: 1 },
  ]),
  UsuarioController.registrarUsuarioPorAdmin
);

// Actualizar usuario por ID
UsuarioRouter.put(
  "/:id",
  authenticate, 
  validateUsuarioId,
  validateUsuarioNoExiste,
  validateUsuarioBody,
  handleInputErrors,
  UsuarioController.actualizarUsuarioId
);

// Eliminar usuario por ID
UsuarioRouter.delete(
  "/:id",
  validateUsuarioId,
  authenticate, 
  handleInputErrors,
  UsuarioController.borrarUsuarioId
);

/* ---------------------------------------------
   AUTENTICACIÓN Y CUENTAS
----------------------------------------------*/

// Confirmar cuenta con token
UsuarioRouter.post(
  "/confirm-account",
  body("token")
    .notEmpty()
    .isLength({ min: 6, max: 6 })
    .withMessage("Token no válido"),
  handleInputErrors,
  UsuarioController.confirmAccount
);

// Iniciar sesión
UsuarioRouter.post(
  "/login",
  body("Correo")
    .isEmail()
    .withMessage("Correo no válido"),
  body("Contrasena")
    .notEmpty()
    .withMessage("La contraseña es obligatoria"),
  handleInputErrors,
  UsuarioController.login
);

// Solicitar restablecimiento de contraseña
UsuarioRouter.post(
  "/forgot-password",
  body("Correo")
    .isEmail()
    .withMessage("Correo no válido"),
  handleInputErrors,
  UsuarioController.forgotContrasena
);

// Validar token de recuperación
UsuarioRouter.post(
  "/validate-token",
  body("token")
    .notEmpty()
    .isLength({ min: 6, max: 6 })
    .withMessage("Token no válido"),
  handleInputErrors,
  UsuarioController.validateToken
);

// Restablecer contraseña con token
UsuarioRouter.post(
  "/reset-password/:token",
  param("token")
    .notEmpty()
    .isLength({ min: 6, max: 6 })
    .withMessage("Token no válido"),
  body("Contrasena")
    .isLength({ min: 8 })
    .withMessage("La contraseña es muy corta, mínimo 8 caracteres"),
  handleInputErrors,
  UsuarioController.resetpasswordWithToken
);

UsuarioRouter.post('/update-password',
  authenticate,
  body("Actualizar_Contrasena")
    .notEmpty().withMessage("La contraseña actual no puede ir vacía")
    .isLength({ min: 8 }).withMessage("La contraseña actual debe tener al menos 8 caracteres"),
  body("Contrasena")
    .isLength({ min: 8 }).withMessage("La contraseña nueva es muy corta, mínimo 8 caracteres"),
  handleInputErrors,
  UsuarioController.updateCurrentPassword
);


UsuarioRouter.put(
  "/cambiar-rol/:id",
  authenticate,
  authorizeAdmin,
  UsuarioController.cambiarRolUsuario
);





// Exportar el router
export default UsuarioRouter;
