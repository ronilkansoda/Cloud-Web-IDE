const FileTreeNode = ({ fileName, nodes, onSelect, path }) => {
    const isDir = !!nodes;
    return (
        <div onClick={(e) => {
            e.stopPropagation()
            if (isDir) return;

            onSelect(path)
        }}>
            <p className={isDir ? "folder-node" : "file-node"}>{fileName}</p>

            {nodes && (
                <ul>
                    {Object.keys(nodes).map((child) => (
                        <li key={child} style={{ marginLeft: '20px' }}>
                            <FileTreeNode onSelect={onSelect} fileName={child} nodes={nodes[child]} path={path + "/" + child} />
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}

export default function FileTree({ tree, onSelect }) {
    return (
        <FileTreeNode onSelect={onSelect} fileName="/"
            nodes={tree} path="" />
    )
}
