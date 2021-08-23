import ModalForm from "./ModalForm";
import NodeTypes from "./NodeTypes";
import { Graph } from "react-d3-graph";
import { React, useState, useEffect } from "react";
import { Row, Col, Button, Container, Toast } from "react-bootstrap";
import { faHome } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Notification from "./Notification";
import { useHistory } from "react-router-dom";

const TopoBuilder = ({
  topoData,
  setTopoData,
  graphConfig,
  onClickLink,
  createTopology,
}) => {
  // changes <title> of the tab with respect to the page/components
  useEffect(() => {
    document.title = "Topology Builder";
  }, []);

  const history = useHistory();
  const [showNodeModel, setShowNodeModel] = useState(false);
  const [nodeConfig, setNodeConfig] = useState({
    memory: "",
    cache: "",
    radius: "",
    angle: "",
    cpu: "",
  });
  const [nodesNum, setNodesNum] = useState(topoData.nodes.length);
  const [nodeCordinates, setNodeCordinates] = useState({
    x: Math.random() * 200,
    y: Math.random() * 200,
  });
  const addNode = (multiplier, nodeType) => {
    if (nodeType !== "Custom Node") {
      setNodeConfig({
        memory: 1024 * multiplier,
        cache: 512 * multiplier,
        angle: 0.0,
        radius: 0.0,
        cpu: 10 * multiplier,
      });
    }
    setNodesNum(nodesNum + 1);
    const nodes = topoData.nodes.concat({
      id: `node${nodesNum}`,
      x: nodeCordinates.x,
      y: nodeCordinates.y,
      memory: nodeConfig.memory,
      radius: nodeConfig.radius,
      cache: nodeConfig.cache,
      angle: nodeConfig.angle,
      cpu: nodeConfig.cpu / 100,

    });
    setTopoData({ nodes: nodes, links: topoData.links });
    setNodeCordinates({ x: Math.random() * 200, y: Math.random() * 200 });
  };
  const handleNodeInputChange = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    var valid = false;
    switch (name) {
      case "memory":
        valid = value > 0 && value <= 1024 * 1024 ? true : false;
        break;
      case "radius":
        valid = value >= 0 && value <= 1.0 ? true : false;
        break;
      case "cache":
        valid = value > 0 && value <= 1024 * 100 ? true : false;
        break;
      case "angle":
        valid = value >= 0 && value <= 360 ? true : false;
        break;
      case "cpu":
        valid = value > 0 && value <= 100 ? true : false;
        break;
      default:
        break;
    }
    if (!valid) {
      window.alert(`Invalid ${name} value, please enter correct value.`);
      setNodeConfig({
        ...nodeConfig,
        [name]: "",
      });
    } else {
      setNodeConfig({
        ...nodeConfig,
        [event.target.name]: event.target.value,
      });
    }
  };

  const nodeModalFields = [
    {
      name: "memory",
      title: "Memory",
      placeHolder: "in KB's",
      inputValue: nodeConfig.memory,
      changeHandler: handleNodeInputChange,
    },
    {
      name: "cache",
      title: "Cache",
      placeHolder: "in KB's",
      inputValue: nodeConfig.cache,
      changeHandler: handleNodeInputChange,
    },
    {
      name: "radius",
      title: "Radius",
      placeHolder: "<0.0-1.0>",
      inputValue: nodeConfig.radius,
      changeHandler: handleNodeInputChange,
    },
    {
      name: "angle",
      title: "Angle",
      placeHolder: "<0-360>",
      inputValue: nodeConfig.angle,
      changeHandler: handleNodeInputChange,
    },
    {
      name: "cpu",
      title: "CPU",
      placeHolder: "<0-100%>",
      inputValue: nodeConfig.cpu,
      changeHandler: handleNodeInputChange,
    },
  ];

  {
    /************************************************************************/
  }
  {
    /* CONFIGURATION TO ADD LINK */
  }
  const [link, setLink] = useState({ source: "", target: "" });
  useEffect(() => {
    if (link.source === "" && link.target !== "") {
      setLinkToast({
        message: "Set Source Node",
      });
      setShowNotification(true);
    } else if (link.target === "" && link.source !== "") {
      setLinkToast({
        message: "Set Target Node",
      });
      setShowNotification(true);
    } else if (
      link.source === link.target &&
      link.source !== "" &&
      link.target !== ""
    ) {
      setLinkToast({
        message: "Source and Target Node cannot be same",
      });
      setShowNotification(true);
    } else if (
      link.source !== "" &&
      link.target !== "" &&
      link.source !== link.target
    ) {
      setLinkToast({
        message: "Adding Link",
      });
      var temp = topoData.links;
      temp.push(link);
      setTopoData({
        ...topoData,
        links: temp,
      });
      setLink({
        source: "",
        target: "",
      });
      setShowNotification(false);
    }
  }, [link]);
  const [nodeClicked, setNodeClicked] = useState("");
  const [showOption, setShowOption] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [showNotification, setShowNotification] = useState(false);
  const [linkToast, setLinkToast] = useState({
    duration: 0,
    message: "",
  });

  const onRightClickNode = (event, nodeId) => {
    event.preventDefault();
    setShowOption(true);
    setNodeClicked(nodeId);
  };
  const addSource = () => {
    setLink({
      ...link,
      source: nodeClicked,
    });
    setShowOption(false);
  };

  const addDestination = () => {
    setLink({
      ...link,
      target: nodeClicked,
    });
    setShowOption(false);
  };
  {
    /************************************************************************/
  }
  {
    // INSTRUCTIONS
  }
  const instructions = [
    "(1) Right click on node to add Link.",
    "(2) Click on Node to delete it.",
  ];
  const buildInstructions = instructions.map((instruction) => {
    return <p>{instruction}</p>;
  });
  {
    /************************************************************************/
  }
  {
    // DELETING NODES
  }
  const [nodeOptions, setNodeOptions] = useState(false);

  const onClickNode = (nodeId) => {
    setNodeOptions(true);
    setNodeClicked(nodeId);
  };

  const deleteNode = () => {
    //   //also need to remove the links too
    //   var tempLinks = topoData.links;
    //   tempLinks = tempLinks.filter(
    //     (link) => link.source !== nodeClicked || link.target !== nodeClicked
    //   );
    //   var temp = topoData.nodes;
    //   temp = temp.filter((node) => node.id !== nodeClicked);
    //   setTopoData({
    //     links: tempLinks,
    //     nodes: temp,
    //   });
    var links = topoData.links;
    var nodes = topoData.nodes;

    links = links.filter(
      (link) => link.source !== nodeClicked && link.target !== nodeClicked
    );
    nodes = nodes.filter((node) => node.id !== nodeClicked);

    setTopoData({
      nodes: nodes,
      links: links,
    });

    setNodeOptions(false);
    console.log("Deleted Node!");
  };

  {
    /************************************************************************/
  }
  return (
    <Container
      className="text-center"
      style={{ minHeight: "100vh", backgroundColor: "black" }}
    >
      {/************************************************************************/}
      {/* MAIN HEADING */}
      <h1 style={{ fontFamily: "Roboto" }}>
        <span>
          <FontAwesomeIcon icon={faHome}></FontAwesomeIcon>{" "}
        </span>
        Build Topology
      </h1>
      {/************************************************************************/}
      {/************************************************************************/}
      {/* GRAPH COMPONENT */}
      <Row>
        <Col style={{ backgroundColor: "white" }}>
          <Graph
            id="graph-id"
            data={topoData}
            config={graphConfig}
            onRightClickNode={onRightClickNode}
            onClickNode={onClickNode}
            onClickLink={onClickLink}
          ></Graph>
        </Col>
      </Row>
      {/************************************************************************/}
      {/************************************************************************/}
      {/* GENERATE BUTTONS */}
      <Row>
        <Col style={{ padding: "0px" }}>
          <NodeTypes
            addNode={addNode}
            setNodeConfig={setNodeConfig}
            setShowNodeModal={setShowNodeModel}
          ></NodeTypes>
        </Col>
      </Row>
      {/************************************************************************/}
      {/************************************************************************/}
      {/* Buttons */}
      <Row style={{ marginTop: "5px" }}>
        <Col>
          <Button variant="dark" onClick={() => setShowInstructions(true)}>
            Instructions
          </Button>
        </Col>
        <Col>
          <Button variant="dark" onClick={() => createTopology(history)}>
            Submit
          </Button>
        </Col>
      </Row>
      {/************************************************************************/}
      {/************************************************************************/}
      {/* NODE MODAL */}
      <ModalForm
        title="Add Node"
        config={nodeConfig}
        fields={nodeModalFields}
        showModal={showNodeModel}
        setShowModal={setShowNodeModel}
        submitHandler={addNode}
      />
      {/************************************************************************/}
      {/************************************************************************/}
      {/* INSTRUCTIONS */}
      <div style={{ position: "fixed", top: "0px", right: "14px" }}>
        <Notification
          title="Instructions"
          show={showInstructions}
          setShow={setShowInstructions}
          message={buildInstructions}
        />
        {/************************************************************************/}
        {/************************************************************************/}
        {/* NOTIFICATION */}
        <Notification
          title="Adding Link"
          show={showNotification}
          setShow={setShowNotification}
          message={linkToast.message}
        />
        {/************************************************************************/}
        {/************************************************************************/}
        {/* ADD LINK */}
        <Toast show={showOption} onClose={() => setShowOption(false)}>
          <Toast.Header>
            <strong className="me-auto block">Link Options</strong>
          </Toast.Header>
          <Toast.Body className="text-left text-white bg-dark">
            Select the node as link source or destination
            <hr></hr>
            <div className="d-flex" style={{ justifyContent: "space-around" }}>
              <Button variant="secondary" onClick={addSource}>
                Source
              </Button>
              <Button variant="secondary" onClick={addDestination}>
                Destination
              </Button>
            </div>
          </Toast.Body>
        </Toast>
        {/************************************************************************/}
        {/************************************************************************/}
        {/* DELETE NODE */}
        <Toast show={nodeOptions} onClose={() => setNodeOptions(false)}>
          <Toast.Header>
            <strong className="me-auto block">Node Options</strong>
          </Toast.Header>
          <Toast.Body className="text-left text-white bg-dark">
            <div className="d-flex" style={{ justifyContent: "space-around" }}>
              <Button variant="secondary" onClick={deleteNode}>
                Delete Node
              </Button>
            </div>
          </Toast.Body>
        </Toast>
      </div>
    </Container>
  );
};

export default TopoBuilder;
