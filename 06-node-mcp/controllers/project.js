const fs = require('fs');
const path = require('path');
const Project = require('../models/Project');

const save = (req, res) => {

    let body = req.body;

    if(!body.name || !body.description || !body.state) {
        return res.status(400).send({
            status: "error",
            message: "Faltan datos por enviar"
        });
    }

    let projectoToSave = new Project(body);

    projectoToSave.save().then((project) => {

        if(!project) {
            return res.status(404).send({
                status: "error",
                message: "No se ha podido guardar el proyecto"
            });
        }

        return res.status(200).send({
            status: "success",
            project: project
        });
    }).catch((error) => {
        return res.status(500).send({
            status: "error",
            message: "Error al guardar el proyecto",
            error
        });
    });
}

const list = (req, res) => {
    Project.find().then((projects) => {
        if(!projects) {
            return res.status(404).send({
                status: "error",
                message: "No hay proyectos para mostrar"
            });
        }

        return res.status(200).send({
            status: "success",
            projects
        });
    })
    .catch((error) => {
        return res.status(500).send({
            status: "error",
            message: "Error al listar los proyectos",
            error
        });
    });
}

const item = (req, res) => {
    let projectId = req.params.id;

    if(!projectId) {
        return res.status(400).send({
            status: "error",
            message: "Faltan datos por enviar"
        });
    }

    Project.findById(projectId).then((project) => {
        if(!project) {
            return res.status(404).send({
                status: "error",
                message: "No se ha encontrado el proyecto"
            });
        }

        return res.status(200).send({
            status: "success",
            project
        });
    }).catch((error) => {
        return res.status(500).send({
            status: "error",
            message: "Error al obtener el proyecto",
            error
        });
    });
}

const deleteProject = (req, res) => {

    let projectId = req.params.id;

    if(!projectId) {
        return res.status(400).send({
            status: "error",
            message: "Faltan datos por enviar"
        });
    }

    Project.findByIdAndDelete(projectId)
    .then((project) => {
        if(!project) {
            return res.status(404).send({
                status: "error",
                message: "No se ha borrado el proyecto"
            });
        }

        return res.status(200).send({
            status: "success",
            project
        });
    }).catch((error) => {
        return res.status(500).send({
            status: "error",
            message: "Error al eliminar el proyecto",
            error
        });
    });
}

const update = (req, res) => {

    let body = req.body;

    if(!body || !body.id) {
        return res.status(400).send({
            status: "error",
            message: "No has enviado nada"
        });
    }

    Project.findByIdAndUpdate(body.id, body, {new: true})
    .then((projectUpdate) => {
        if(!projectUpdate) {
            return res.status(404).send({
                status: "error",
                message: "No se ha actualizado el proyecto"
            });
        }

        return res.status(200).send({
            status: "success",
            project: projectUpdate
        });
    }).catch((error) => {
        return res.status(500).send({
            status: "error",
            message: "Error al actualizar el proyecto",
            error
        });
    });
}

const upload = (req, res) => {

    let id = req.params.id;
    
    if(!req.file) {
        return res.status(400).json({
            status: "error",
            message: "No has subido ningún archivo"
        });
    }

    const filePath = req.file.path;
    const extension = path.extname(req.file.originalname).toLowerCase().replace('.', '');

    const validExtensions = ['png', 'jpg', 'jpeg', 'gif'];

    if(!validExtensions.includes(extension)) {
        fs.unlinkSync(filePath);
        return res.status(400).json({
            status: "error",
            message: "Extensión no válida"
        });
    }

    Project.findById(id)
    .then((project) => {
        if (!project) {
            fs.unlinkSync(filePath);
            return res.status(404).send({
                status: "error",
                message: "No se ha encontrado el proyecto"
            });
        }

        const oldImage = project.image;

        Project.findByIdAndUpdate({_id: id}, {image: req.file.filename }, {new: true})
        .then((projectUpdate) => {
            if(!projectUpdate) {
                fs.unlinkSync(filePath);
                return res.status(404).send({
                    status: "error",
                    message: "No se ha actualizado el proyecto"
                });
            }

            if(oldImage && oldImage !== "default.png") {
                const oldImagePath = path.join("./uploads/images/", oldImage);
                if(fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }

            return res.status(200).send({
                status: "success",
                project: {
                    ...projectUpdate.toObject(),
                    image: oldImage 
                },
                newFile: req.file.filename 
            });
        }).catch((error) => {
            fs.unlinkSync(filePath);
            return res.status(500).send({
                status: "error",
                message: "Error al actualizar el proyecto",
                error
            });
        });
    })
    .catch((error) => {
        fs.unlinkSync(filePath);
        return res.status(500).send({
            status: "error",
            message: "Error al buscar el proyecto",
            error
        });
    });
}

module.exports = {
    save,
    list,
    item,
    deleteProject,
    update,
    upload
};