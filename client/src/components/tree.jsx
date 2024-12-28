const FileTreeNode = ({ fileName, nodes }) => {
    const isDir = !!nodes;
    return (
        <div>
            <p className={isDir ? "file-node" : ""}>{fileName}</p>

            {nodes && (
                <ul>
                    {Object.keys(nodes).map((child) => (
                        <li key={child} style={{ marginLeft: '20px' }}>
                            <FileTreeNode fileName={child} nodes={nodes[child]} />
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}

export default function FileTree({ tree }) {
    return (
        <FileTreeNode fileName="/"
            nodes={tree} />
    )
}
