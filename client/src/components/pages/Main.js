import React, { useEffect, useState } from "react";

import api from "../../api";
import utils from "../../utils";
import "./Main.css";

import MachineList from "../modules/MachineList";
import { Dropdown, Header, Button } from "semantic-ui-react";

function Main() {
  const [machines, setMachines] = useState([]);
  const [currentLocation, setCurrentLocation] = useState("");
  const [machineType, setMachineType] = useState("washer");

  async function fetchDataAndUpdate() {
    const response = await api.getMachines();
    const data = await response.data;
    const machines = Array.from(Object.values(data.machines));
    machines.forEach((machine) => {
      machine.since = new Date(machine.since);
    });
    machines.forEach((machine) => {
      machine.queryTimestamp = new Date(machine.queryTimestamp);
    });
    setMachines(machines);
  }

  useEffect(() => {
    fetchDataAndUpdate();
    const task = setInterval(() => fetchDataAndUpdate(), 60 * 1000);
    return () => clearInterval(task);
  }, []);

  const locations = [...new Set(machines.map((machine) => machine.location))];
  const locationOptions = locations.map((location) => {
    return { key: location, value: location, text: location };
  });
  if (currentLocation === "" && locations.length > 0) setCurrentLocation(locations[0]);

  const dormMachines = machines
    .filter((machine) => machine.location === currentLocation)
    .filter((machine) => machineType === "both" || machine.type === machineType);

  const available = dormMachines.filter((machine) => machine.status === "available");
  available.sort((a, b) => a.since - b.since).reverse();
  const unavailable = dormMachines.filter((machine) => machine.status !== "available");
  unavailable.sort((a, b) => a.since - b.since).reverse();

  return (
    <div id="main">
      <div style={{ display: "flex", flexWrap: "wrap" }}>
        <div style={{ marginRight: "40px", marginBottom: "40px" }}>
          <Header as="h2" style={{ marginBottom: "30px" }}>
            MIT Laundry Status
          </Header>
          <div>
            <Header sub>Location</Header>
            <Dropdown
              placeholder="Select location"
              selection
              options={locationOptions}
              value={currentLocation}
              onChange={(e, { value }) => {
                setCurrentLocation(value);
              }}
            />
          </div>

          <div style={{ marginTop: "20px" }}>
            <Header sub>Machine type</Header>
            <Button.Group onClick={(e) => setMachineType(e.target.value)}>
              <Button value="washer" active={machineType === "washer"}>
                Washer
              </Button>
              <Button value="dryer" active={machineType === "dryer"}>
                Dryer
              </Button>
              <Button value="both" active={machineType === "both"}>
                Both
              </Button>
            </Button.Group>
          </div>
        </div>

        <div style={{ flexBasis: 0, flexGrow: 999, minInlineSize: "70%" }}>
          <Header as="h2">{currentLocation}</Header>

          <Header as="h3">
            Available machines
            <Header.Subheader>
              Sorted by least recently used machines first, so you know whose clothes to throw out.
              You're welcome.
            </Header.Subheader>
          </Header>
          <MachineList machines={available} />

          <Header as="h3">
            Machines in use
            <Header.Subheader>
              In case everyone happens to be doing laundry on a Sunday night.
            </Header.Subheader>
          </Header>

          <MachineList machines={unavailable} />
        </div>
      </div>
    </div>
  );
}

export default Main;