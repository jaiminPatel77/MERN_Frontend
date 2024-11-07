import React, { useRef, useEffect } from 'react';
import 'ol/ol.css';
import { Map, View, Overlay } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import Style from 'ol/style/Style';
import Icon from 'ol/style/Icon';
import locationMark from './location-mark.png';
import './Map.css';

const MyMap = props => {
  const mapRef = useRef();
  const popupRef = useRef();

  useEffect(() => {
    const { center, zoom } = props;

    const marker = new Feature({
      geometry: new Point(fromLonLat([center.lng, center.lat])),
    });

    const iconStyle = new Style({
      image: new Icon({
        anchor: [0.5, 1],
        src: locationMark,
      }),
    });

    marker.setStyle(iconStyle);

    const vectorSource = new VectorSource({
      features: [marker],
    });

    const vectorLayer = new VectorLayer({
      source: vectorSource,
    });

    const map = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
        vectorLayer,
      ],
      view: new View({
        center: fromLonLat([center.lng, center.lat]),
        zoom: zoom,
      }),
    });

    // Popup overlay
    const popupOverlay = new Overlay({
      element: popupRef.current,
      positioning: 'bottom-center',
      stopEvent: false,
      offset: [0, -50],
    });

    map.addOverlay(popupOverlay);

    // Display popup on click
    map.on('click', (event) => {
      const feature = map.forEachFeatureAtPixel(event.pixel, (feature) => feature);

      if (feature) {
        const coordinates = feature.getGeometry().getCoordinates();
        popupOverlay.setPosition(coordinates);
        popupRef.current.style.display = 'block';
      } else {
        popupRef.current.style.display = 'none';
      }
    });

    // Cleanup on component unmount
    return () => map.setTarget(undefined);
  }, [props]);

  return (
    <div ref={mapRef} className="map">
      <div ref={popupRef} className="ol-popup">
        <div className="ol-popup-content">You are here!</div>
      </div>
    </div>
  );
};

export default MyMap;
