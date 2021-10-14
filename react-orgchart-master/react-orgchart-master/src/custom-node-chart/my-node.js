import React from "react";
import PropTypes from "prop-types";
import "./my-node.css";

const propTypes = {
  nodeData: PropTypes.object.isRequired
};

const MyNode = ({ nodeData }) => {
  let data = { nodeData }
  const selectNode = () => {
    //alert("Hi All. I'm " + nodeData.name + ". I'm a " + nodeData.title + ".");
  };

  return (
    <div onClick={selectNode}>
      <div className="position">{nodeData.title}</div>
      {/* <div className="fullname">{nodeData.name}</div> */}
      <div className="fullname">
        <table>
          {Object.keys(data.nodeData).map((key, i) => (
            key != "children" && key!="relationship" && key!="id"?
              // <p key={i}>
                <tr>
                  <td>{key}</td>
                  <td>{data.nodeData[key].toString()}</td>
                </tr>
                // <span>{key} : {data.nodeData[key].toString()}</span>
              // </p> 
              : ""))
          }
        </table>
      </div>
    </div>
  );
};

MyNode.propTypes = propTypes;

export default MyNode;
