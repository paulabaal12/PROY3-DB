import CytoscapeComponent from "react-cytoscapejs";

export default function GrafoPuzzle({ nodes = [], edges = [] }) {
  const elements = [
    ...nodes.map((node) => ({
      data: { id: node.id, label: node.label || node.id },
      // Si quieres posicionar nodos puedes pasar position aquí, o usar layouts automáticos
    })),
    ...edges.map((edge, idx) => ({
      data: {
        source: edge.source,
        target: edge.target,
        label: edge.label,
        id: `edge-${idx}`
      },
    })),
  ];

  return (
    <div>
      <CytoscapeComponent
        elements={elements}
        style={{ width: "100%", height: "350px", background: "#f8fafc", borderRadius: 12 }}
        layout={{ name: "cose" }} // Puedes probar otros layouts: 'circle', 'breadthfirst', etc.
        cy={(cy) => cy.fit()}
      />
    </div>
  );
}
