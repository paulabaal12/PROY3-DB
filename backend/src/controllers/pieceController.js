const neo4j = require('../utils/neo4j');

// Obtener todas las piezas
const getAllPieces = async (req, res) => {
  try {
    const query = `
      MATCH (p:Pieza)
      RETURN p
    `;
    const result = await neo4j.executeQuery(query);
    const piezas = result.map(r => r.p.properties);
    res.json(piezas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener pieza por ID
const getPieceById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      MATCH (p:Pieza {id: $id})
      OPTIONAL MATCH (p)-[c:CONECTA_CON]->(p2:Pieza)
      RETURN p, collect({to: p2.id, lado: c.lado}) AS conexiones
    `;
    const result = await neo4j.executeQuery(query, { id });
    if (!result[0] || !result[0].p) return res.status(404).json({ error: "Pieza no encontrada" });

    const pieza = result[0].p.properties;
    const conexiones = (result[0].conexiones || []).filter(c => c.to !== null);

    res.json({ ...pieza, conexiones });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getAllPieces, getPieceById };
