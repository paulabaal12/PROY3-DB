const express = require('express');
const { 
  createPuzzle, 
  getAllPuzzles, 
  getPuzzle, 
  buildPuzzleSteps, 
  getPuzzleInstructions 
} = require('../controllers/puzzleController');
const router = express.Router();

// Middleware de validación para el registro de puzzles
const validatePuzzleData = (req, res, next) => {
  const { puzzle, pieces } = req.body;
  if (!puzzle || !pieces) {
    return res.status(400).json({ error: 'Datos incompletos' });
  }
  if (!puzzle.id) {
    return res.status(400).json({ error: 'ID de rompecabezas requerido' });
  }
  next();
};

// Registro de un nuevo puzzle
router.post('/', validatePuzzleData, createPuzzle);

// Obtener todos los puzzles
router.get('/', getAllPuzzles);

// Obtener detalles de un puzzle por ID
router.get('/:id', getPuzzle);

// Obtener pasos de armado (BFS/DFS)
router.get('/:id/steps', buildPuzzleSteps);

// Obtener instrucciones con apoc.path.expand (experimental/extra)
router.get('/:id/instrucciones', getPuzzleInstructions);

module.exports = router;
