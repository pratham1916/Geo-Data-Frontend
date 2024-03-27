import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Polygon, FeatureGroup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import { EditControl } from 'react-leaflet-draw';

const MapView = () => {
  const [initialCoordinates, setInitialCoordinates] = useState(null);
  const [mapPoints, setMapPoints] = useState([]);
  const [myData, setMyData] = useState([]);
  const [selectedData, setSelectedData] = useState([]);
  const [titles, setTitles] = useState([]);
  const [newShape, setNewShape] = useState(null);

  const reverseCoordinates = (arr) => {
    return [arr[1], arr[0]];
  };

  useEffect(() => {
    const selectedCoordinates = myData[selectedData];
    if (selectedCoordinates) {
      const first = reverseCoordinates(selectedCoordinates[0]);
      const map = selectedCoordinates.map((e) => {
        return { location: reverseCoordinates(e) };
      });

      setInitialCoordinates(first);
      setMapPoints(map.map(mp => mp.location));
    }
  }, [selectedData, myData]);

  useEffect(() => {
    const fetchCoordinates = async () => {
      try {
        const response = await axios.get('http://localhost:8080/geodata/list');
        const userid = localStorage.getItem("userId");
        const data = response.data
          .filter((e) => e.user_id === userid)
          .map((e) => JSON.parse(e.geometry).coordinates[0]);
        
        const titlesData = response.data
          .filter((e) => e.user_id === userid)
          .map((e) => e.title);

        setMyData(data);
        setTitles(titlesData);

      } catch (error) {
        console.error('Failed to fetch coordinates:', error);
      }
    };

    fetchCoordinates();
  }, []);

  const handleCreated = e => {
    const createdShape = e.layer.toGeoJSON().geometry.coordinates;
    setNewShape(createdShape);
  };

  const handleSaveShape = () => {
    if (newShape) {
      console.log(newShape);
      setNewShape(null);
    }
  };

  return (
    <div style={{ marginTop: "100px", textAlign: "center", color: "black" }}>
      <select onChange={(e) => setSelectedData(e.target.value)}>
        <option value="">Select a point</option>
        {titles.map((title, i) => (
          <option key={i} value={i}>{title}</option>
        ))}
      </select>

      {newShape && (
        <button className='btn btn1' style={{margin:"0",marginLeft:"20px" }} onClick={handleSaveShape}>Save Shape</button>
      )}

      <div style={{ width: "90%", height: "500px", margin: "20px auto" }}>
        {initialCoordinates && (
          <MapContainer center={initialCoordinates} zoom={7} style={{ height: '500px', width: '100%', borderRadius: '10px' }}>
            <TileLayer url="http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {mapPoints.length > 0 && <Polygon positions={mapPoints} />}
            <FeatureGroup>
              <EditControl
                position='topright'
                onCreated={handleCreated}
                draw={{
                  rectangle: false,
                  circlemarker: false,
                }}
              />
            </FeatureGroup>
          </MapContainer>
        )}
      </div>
    </div>
  );
};

export default MapView;
