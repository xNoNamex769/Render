import { Router } from "express";
import { RolusuarioController } from "../controllers/RolUsuarioController";
import { handleInputErrors } from "../middleware/validation";
import { body, param } from "express-validator";
import { validateIdRolusuario, validateIdRolUsuarioYaExiste, validateRolUsuarioBody} from "../middleware/RolUsuario";

const router = Router()

router.get('/', RolusuarioController.getAll);
//ver roles por id
router.get('/:id', 
    validateIdRolusuario,
    handleInputErrors,
    RolusuarioController.getRolUsuarioId
)

router.post('/', 
    validateIdRolUsuarioYaExiste,
    validateRolUsuarioBody,
    RolusuarioController.CrearRolUsuario);

router.put('/:id',
    validateIdRolusuario,
    validateRolUsuarioBody,
    RolusuarioController.ActualizarUsuario
)

router.delete('/:id',
    param('id').isInt().withMessage('Id no Valido')
    .custom(value => value > 0).withMessage('Id no válido'),
    handleInputErrors,
    RolusuarioController.EliminarRolUsuario
)

export default router;