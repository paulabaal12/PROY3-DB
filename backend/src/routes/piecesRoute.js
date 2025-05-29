const express = require('express');
const { getAllPieces, getPieceById } = require('../controllers/pieceController');
const router = express.Router();

router.get('/', getAllPieces);      // Listar todas las piezas
router.get('/:id', getPieceById);   // Obtener una pieza por ID

module.exports = router;
