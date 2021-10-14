import React, { useRef, useState, useEffect } from "react";
import JSONDigger from "json-digger";
import { v4 as uuidv4 } from "uuid";
import OrganizationChart from "../components/ChartContainer";
import "./edit-chart.css";
import ReactJson from 'react-json-view';
import MyNode from "../custom-node-chart/my-node";



const EditChart = () => {
  const orgchart = useRef();
  const datasource = {
    id: "n1",
    name: "Claim Assistance",
    title: "Menu Options",
    children: [
      { id: "n2", name: "Claim Status", title: "Claim Status" },
      {
        id: "n3",
        name: "File a Claim",
        title: "File a Claim",
        intent: "Placeholder",
        children: [
          {
            id: "n5",
            name: "Policy Number",
            title: "Enter Policy Number",
            children: [
              { id: "n6", name: "Validation", title: "Policy Number Validation" }
            ]
          }
        ]
      },
      {
        id: "n10",
        name: "Change Topic",
        title: "Change Topic",
        children: [
          {
            id: "n11", name: "Main Menu Choice", title: "Redirect to Main Menu?",
            children: [
              { id: "n12", name: "Yes", title: "Yes" },
              { id: "n13", name: "No", title: "No" }
            ]
          }
        ]
      }
    ]
  };


  const getJsonData = () => {
    let jsonData = localStorage.getItem('JsonData'); // TODO : Replacing it with the logic for retreiving data from a database
  
    if(jsonData) {
      return JSON.parse(localStorage.getItem('JsonData'));
    } else {
      return datasource;
    }
  };

  // const [ds, setDS] = useState(datasource);
  const [ds, setDS] = useState(getJsonData()); 

  const dsDigger = new JSONDigger(ds, "id", "children");

  const [selectedNodes, setSelectedNodes] = useState(new Set());
  const [newNodes, setNewNodes] = useState([{ name: "", title: "" }]);
  const [isEditMode, setIsEditMode] = useState(true);
  const [isMultipleSelect, setIsMultipleSelect] = useState(false);
  const [newNodeName, setNewNodeName] = useState("");
  const [newNodeTitle, setNewNodeTitle] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [detailsNode, setDetailsNode] = useState({})


  const readSelectedNode = nodeData => {
    if (isMultipleSelect) {
      setSelectedNodes(prev => new Set(prev.add(nodeData)));
    } else {
      setSelectedNodes(new Set([nodeData]));
    }
  };

  const clearSelectedNode = () => {
    setSelectedNodes(new Set());
  };

  const onNameChange = (e, index) => {
    newNodes[index].name = e.target.value;
    setNewNodes([...newNodes]);
    setNewNodeName(e.target.value);
  };

  const onTitleChange = (e, index) => {
    newNodes[index].title = e.target.value;
    setNewNodes([...newNodes]);
    setNewNodeTitle(e.target.value);
  };

  const addNewNode = () => {
    setNewNodes(prevNewNodes => [...prevNewNodes, { name: "", title: "" }]);
  };

  const removeNewNode = index => {
    setNewNodes(prevNewNodes => {
      prevNewNodes.splice(index, 1);
      return [...prevNewNodes];
    });
  };

  const getNewNodes = () => {
    const nodes = [];
    for (const node of newNodes) {
      nodes.push({ ...node, id: uuidv4() });
    }
    return nodes;
  };

  const addChildNodes = async () => {
    await dsDigger.addChildren([...selectedNodes][0].id, getNewNodes());
    setDS({ ...dsDigger.ds });
  };

  const addSiblingNodes = async () => {
    await dsDigger.addSiblings([...selectedNodes][0].id, getNewNodes());
    setDS({ ...dsDigger.ds });
  };

  const addRootNode = () => {
    dsDigger.addRoot(getNewNodes()[0]);
    setDS({ ...dsDigger.ds });
  };

  const remove = async () => {
    await dsDigger.removeNodes([...selectedNodes].map(node => node.id));
    setDS({ ...dsDigger.ds });
    setSelectedNodes(new Set());
  };

  const updateNodes = async () => {
    await dsDigger.updateNodes([...selectedNodes].map(node => node.id), { id: uuidv4(), name: newNodeName, title: newNodeTitle });
    setDS({ ...dsDigger.ds });

  };

  const updateProperties = async () => {
    let node = await dsDigger.findNodeById([...selectedNodes].map(node => node.id)[0])
    node[newNodeName] = newNodeTitle;
    let nodes = [node];
    await dsDigger.addSiblings([...selectedNodes].map(node => node.id)[0], nodes);
    await dsDigger.removeNodes([...selectedNodes].map(node => node.id));
    setDS({ ...dsDigger.ds });
    setShowDetails(true)
    setDetailsNode(node);
    console.log(ds)
  }

  const showNodeDetails = async () => {
    let node = null;
    if ([...selectedNodes].map(node => node.id)[0]) {
      node = await dsDigger.findNodeById([...selectedNodes].map(node => node.id)[0])
    }
    else {
      node = ds
    }

    setDetailsNode(node);
    setShowDetails(!showDetails)
  }

  const onMultipleSelectChange = e => {
    setIsMultipleSelect(e.target.checked);
  };

  const onModeChange = e => {
    setIsEditMode(e.target.checked);
    if (e.target.checked) {
      orgchart.current.expandAllNodes();
    }
  };

  useEffect(() => {
    localStorage.setItem('JsonData', JSON.stringify(ds)); // TODO : Replacing it with the logic for storing data(ds) in a database
  }, [ds]);

  return (
    <div className="edit-chart-wrapper">
      <section className="toolbar">
        {/* <div className="selected-nodes">
          <div>
            <h4 style={{ display: "inline-block" }}>Selected Node</h4>
            <input
              style={{ marginLeft: "1rem" }}
              id="cb-multiple-select"
              type="checkbox"
              checked={isMultipleSelect}
              onChange={onMultipleSelectChange}
            />
            <label htmlFor="cb-multiple-select">Multiple Select</label>
          </div>
          <ul>
            {Array.from(selectedNodes).map(node => (
              <li key={node.id}>
                {node.name} - {node.title}
              </li>
            ))}
          </ul>
        </div> */}
        <div className="new-nodes">
          <h4>New Nodes</h4>
          <ul>
            {newNodes &&
              newNodes.map((node, index) => (
                <li key={index}>
                  <input
                    type="text"
                    placeholder="name"
                    value={node.name}
                    onChange={e => onNameChange(e, index)}
                  />
                  <input
                    type="text"
                    placeholder="title"
                    value={node.title}
                    onChange={e => onTitleChange(e, index)}
                  />
                  {newNodes.length === 1 || index === newNodes.length - 1 ? (
                    <button disabled={!isEditMode} onClick={addNewNode}>
                      +
                    </button>
                  ) : (
                      <button
                        disabled={!isEditMode}
                        onClick={() => removeNewNode(index)}
                      >
                        -
                      </button>
                    )}
                </li>
              ))}
          </ul>
        </div>
        <div className="action-buttons">
          <button disabled={!isEditMode} onClick={addChildNodes}>
            Add Child Nodes
          </button>
          <button disabled={!isEditMode} onClick={addSiblingNodes}>
            Add Sibling Nodes
          </button>
          <button disabled={!isEditMode} onClick={addRootNode}>
            Add Root Node
          </button>
          <button disabled={!isEditMode} onClick={remove}>
            Remove Nodes
          </button>
          <button disabled={!isEditMode} onClick={updateNodes}>
            Update Nodes
          </button>
          <button disabled={!isEditMode} onClick={updateProperties}>
            Update Properties
          </button>
          <button disabled={!isEditMode} onClick={showNodeDetails}>
            {!showDetails ? "Show Details" : "Hide Details"}
          </button>
          <input
            style={{ marginLeft: "1rem" }}
            id="cb-mode"
            type="checkbox"
            checked={isEditMode}
            onChange={onModeChange}
          />
          <label htmlFor="cb-mode">Edit Mode</label>
        </div>
      </section>
      {/* <div className="treeView"> */}
      {/* {showDetails ?
          <ReactJson src={detailsNode} /> : ""} */}
      <div>
        <OrganizationChart
          ref={orgchart}
          datasource={ds}
          collapsible={!isEditMode}
          multipleSelect={isMultipleSelect}
          onClickNode={readSelectedNode}
          onClickChart={clearSelectedNode}
          draggable={true}
          chartClass="myChart"
          NodeTemplate={MyNode}
        /></div>
    </div>
  );
};

export default EditChart;
