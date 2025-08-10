import { db } from './config/db'; // Asegúrate de que este sea el archivo donde defines Sequelize
import { RolUsuario } from './models/RolUsuario';

// Asegura que los modelos estén registrados
db.addModels([RolUsuario]);

const seedRoles = async () => {
  try {
    await db.sync(); // opcional si ya está sincronizado en otro lugar

    const count = await RolUsuario.count();
    if (count === 0) {
      await RolUsuario.bulkCreate([
        { IdRol: 1, NombreRol: 'Administrador' },
        { IdRol: 2, NombreRol: 'Aprendiz' },
        { IdRol: 3, NombreRol: 'Instructor' },
      ]);
      console.log('✅ Roles insertados correctamente.');
    } else {
      console.log('ℹ️ Ya existen roles en la base de datos.');
    }
  } catch (error) {
    console.error('❌ Error al insertar roles:', error);
  } finally {
    await db.close(); // cerrar la conexión si solo estás usando este script
  }
};

seedRoles();
