"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { Plus, Trash2, Play, Puzzle, Search, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import GrafoPuzzle from "./components/GrafoPuzzle";

const API_URL = import.meta.env.VITE_API_URL

function App() {
  // Estados para el registro
  const [puzzle, setPuzzle] = useState({ id: "", tema: "", tipo: "" })
  const [pieces, setPieces] = useState([])
  const [connections, setConnections] = useState([])

  // Estados para la consulta
  const [puzzles, setPuzzles] = useState([])
  const [selectedPuzzleId, setSelectedPuzzleId] = useState("")
  const [pasos, setPasos] = useState([])
  const [alg, setAlg] = useState("bfs")
  const [startId, setStartId] = useState("")

  // Estados de UI
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [solvingLoading, setSolvingLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("register")

  // Consulta de puzzles existentes
  useEffect(() => {
    setLoading(true)
    axios
      .get(`${API_URL}/puzzles`)
      .then((res) => setPuzzles(res.data))
      .catch(() => setPuzzles([]))
      .finally(() => setLoading(false))
  }, [message])

  // Handlers para registro de rompecabezas
  const addPiece = () => setPieces([...pieces, { id: "", forma: "", posicion_relativa: "" }])
  const addConnection = () =>
    setConnections([...connections, { sourceId: "", targetId: "", sourceSide: "", targetSide: "" }])

  const removePiece = (index) => {
    const updated = pieces.filter((_, i) => i !== index)
    setPieces(updated)
  }

  const removeConnection = (index) => {
    const updated = connections.filter((_, i) => i !== index)
    setConnections(updated)
  }

  const handlePieceChange = (i, field, value) => {
    const updated = [...pieces]
    updated[i][field] = value
    setPieces(updated)
  }

  const handleConnectionChange = (i, field, value) => {
    const updated = [...connections]
    updated[i][field] = value
    setConnections(updated)
  }

  const submitPuzzle = async (e) => {
    e.preventDefault()
    setError("")
    setMessage("")
    setLoading(true)

    try {
      await axios.post(`${API_URL}/puzzles`, {
        puzzle,
        pieces,
        connections,
      })
      setMessage("¡Rompecabezas creado exitosamente!")
      setPuzzle({ id: "", tema: "", tipo: "" })
      setPieces([])
      setConnections([])

      // Clear message after 3 seconds
      setTimeout(() => setMessage(""), 3000)
    } catch (err) {
      setError("Error al crear el rompecabezas. Verifique los datos e intente nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  // Consultar pasos
  const obtenerPasos = async () => {
    setPasos([])
    setError("")
    setSolvingLoading(true)

    try {
      const res = await axios.get(`${API_URL}/puzzles/${selectedPuzzleId}/steps?start=${startId}&alg=${alg}`)
      setPasos(res.data.instrucciones || [])
    } catch {
      setError("No se pudo obtener los pasos. Verifique la pieza inicial y el rompecabezas seleccionado.")
    } finally {
      setSolvingLoading(false)
    }
  }
  const [grafo, setGrafo] = useState({ nodes: [], edges: [] });

  useEffect(() => {
    if (!selectedPuzzleId) {
      setGrafo({ nodes: [], edges: [] });
      return;
    }
    // Consulta piezas y conexiones de este puzzle
    axios
      .get(`${API_URL}/puzzles/${selectedPuzzleId}`)
      .then((res) => {
        const { piezas, conexiones } = res.data;
        setGrafo({
          nodes: (piezas || []).map((p) => ({
            id: p.id,
            label: `${p.id}\n${p.forma}\n${p.posicion_relativa}`,
          })),
          edges: (conexiones || []).map((c) => ({
            source: c.from,
            target: c.to,
            label: c.lado,
          })),
        });
      })
      .catch(() => setGrafo({ nodes: [], edges: [] }));
  }, [selectedPuzzleId]);
  
  const TabButton = ({ id, label, icon: Icon }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
        activeTab === id ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
      }`}
    >
      <Icon size={18} />
      {label}
    </button>
  )

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Puzzle className="text-blue-600" size={32} />
            <h1 className="text-3xl font-bold text-gray-900">Puzzle Solver</h1>
          </div>
          <p className="text-gray-600">Registra y resuelve rompecabezas con algoritmos de búsqueda</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-8 justify-center">
          <TabButton id="register" label="Registrar" icon={Plus} />
          <TabButton id="solve" label="Resolver" icon={Play} />
          <TabButton id="view" label="Ver Puzzles" icon={Search} />
        </div>

        {/* Global Messages */}
        {message && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-800">
            <CheckCircle size={20} />
            {message}
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-800">
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        {/* Register Tab */}
        {activeTab === "register" && (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Registrar Nuevo Rompecabezas</h2>

            <form onSubmit={submitPuzzle} className="space-y-6">
              {/* Puzzle Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ID del Puzzle</label>
                  <input
                    type="text"
                    placeholder="ej: puzzle_001"
                    value={puzzle.id}
                    required
                    onChange={(e) => setPuzzle({ ...puzzle, id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tema</label>
                  <input
                    type="text"
                    placeholder="ej: Paisaje, Animales"
                    value={puzzle.tema}
                    required
                    onChange={(e) => setPuzzle({ ...puzzle, tema: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
                  <input
                    type="text"
                    placeholder="ej: 2D, 3D"
                    value={puzzle.tipo}
                    required
                    onChange={(e) => setPuzzle({ ...puzzle, tipo: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Pieces Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Piezas</h3>
                  <button
                    type="button"
                    onClick={addPiece}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus size={16} />
                    Agregar Pieza
                  </button>
                </div>

                <div className="space-y-3">
                  {pieces.map((piece, i) => (
                    <div key={i} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 bg-gray-50 rounded-lg">
                      <input
                        type="text"
                        placeholder="ID de la pieza"
                        value={piece.id}
                        required
                        onChange={(e) => handlePieceChange(i, "id", e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <input
                        type="text"
                        placeholder="Forma"
                        value={piece.forma}
                        required
                        onChange={(e) => handlePieceChange(i, "forma", e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <input
                        type="text"
                        placeholder="Posición relativa"
                        value={piece.posicion_relativa}
                        required
                        onChange={(e) => handlePieceChange(i, "posicion_relativa", e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => removePiece(i)}
                        className="flex items-center justify-center px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Connections Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Conexiones</h3>
                  <button
                    type="button"
                    onClick={addConnection}
                    className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Plus size={16} />
                    Agregar Conexión
                  </button>
                </div>

                <div className="space-y-3">
                  {connections.map((connection, i) => (
                    <div key={i} className="grid grid-cols-1 md:grid-cols-5 gap-3 p-4 bg-gray-50 rounded-lg">
                      <input
                        type="text"
                        placeholder="ID Origen"
                        value={connection.sourceId}
                        required
                        onChange={(e) => handleConnectionChange(i, "sourceId", e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <input
                        type="text"
                        placeholder="ID Destino"
                        value={connection.targetId}
                        required
                        onChange={(e) => handleConnectionChange(i, "targetId", e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <input
                        type="text"
                        placeholder="Lado Origen"
                        value={connection.sourceSide}
                        required
                        onChange={(e) => handleConnectionChange(i, "sourceSide", e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <input
                        type="text"
                        placeholder="Lado Destino"
                        value={connection.targetSide}
                        required
                        onChange={(e) => handleConnectionChange(i, "targetSide", e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => removeConnection(i)}
                        className="flex items-center justify-center px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? <Loader2 size={20} className="animate-spin" /> : <Plus size={20} />}
                  {loading ? "Registrando..." : "Registrar Rompecabezas"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Solve Tab */}
        {activeTab === "solve" && (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Resolver Rompecabezas</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Controls */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Seleccionar Rompecabezas</label>
                  <select
                    value={selectedPuzzleId}
                    onChange={(e) => setSelectedPuzzleId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Seleccione un rompecabezas</option>
                    {puzzles.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.id} - {p.tema}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pieza Inicial</label>
                  <input
                    type="text"
                    placeholder="ID de la pieza inicial"
                    value={startId}
                    onChange={(e) => setStartId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Algoritmo</label>
                  <select
                    value={alg}
                    onChange={(e) => setAlg(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="bfs">BFS (Búsqueda en Anchura)</option>
                    <option value="dfs">DFS (Búsqueda en Profundidad)</option>
                  </select>
                </div>

                <button
                  onClick={obtenerPasos}
                  disabled={!selectedPuzzleId || !startId || solvingLoading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {solvingLoading ? <Loader2 size={20} className="animate-spin" /> : <Play size={20} />}
                  {solvingLoading ? "Resolviendo..." : "Resolver Puzzle"}
                </button>
              </div>

              {/* Results */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Pasos de Solución</h3>
                {pasos.length > 0 ? (
                  <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                    <ol className="space-y-2">
                      {pasos.map((paso, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center font-medium">
                            {i + 1}
                          </span>
                          <span className="text-gray-700">{paso}</span>
                        </li>
                      ))}
                    </ol>
                    <div className="my-8">
                    <h3 className="font-semibold text-gray-800 mb-2">Visualización del Grafo del Puzzle</h3>
                    <GrafoPuzzle nodes={grafo.nodes} edges={grafo.edges} />
                  </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500">
                    <Puzzle size={48} className="mx-auto mb-4 opacity-50" />
                    <p>Los pasos de solución aparecerán aquí</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* View Tab */}
        {activeTab === "view" && (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Rompecabezas Registrados</h2>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={32} className="animate-spin text-blue-600" />
              </div>
            ) : puzzles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {puzzles.map((puzzle, i) => (
                  <div key={i} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-3">
                      <Puzzle className="text-blue-600 flex-shrink-0 mt-1" size={20} />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">{puzzle.id}</h3>
                        <p className="text-sm text-gray-600 mt-1">Tema: {puzzle.tema}</p>
                        <p className="text-sm text-gray-600">Tipo: {puzzle.tipo}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Puzzle size={48} className="mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">No hay rompecabezas registrados</p>
                <button
                  onClick={() => setActiveTab("register")}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Registrar el primero
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default App
