import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RingLoader } from "react-spinners";

const GLBViewer = ({ src }) => {
    const canvasRef = useRef(null);
    const mouseX = useRef(0);
    const mouseY = useRef(0);
    const [scene, setScene] = useState(null)
    const [tobj, setTobj] = useState(null)
    const [isLoading, setIsLoading] = useState(false);

    useEffect(()=>{
        if(!scene){
            return
        }
        console.log('here')
        if(tobj){
            try{
                scene.remove(tobj)
            }catch(e){

            }
            
        }
        setIsLoading(true)
        const loader = new GLTFLoader();
        loader.load(src, (gltf) => {
            setTobj(gltf.scene)
            scene.add(gltf.scene);
            setIsLoading(false)
        });
    },[src])

    useEffect(() => {

        const scene = new THREE.Scene();
        setScene(scene)
        const camera = new THREE.PerspectiveCamera(
            75,
            canvasRef.current.clientWidth / canvasRef.current.clientHeight,
            0.1,
            1000,
        );

        scene.background = new THREE.Color(0x0f172a);
        const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current });
        renderer.setSize(600, 400);
        
        const controls = new OrbitControls(camera, renderer.domElement);
        
        setIsLoading(true)
        const loader = new GLTFLoader();
        loader.load(src, (gltf) => {
            setTobj(gltf.scene)
            scene.add(gltf.scene);
            setIsLoading(false)
        });

        camera.position.z = 15;
        camera.position.y = 15;
        // Add a point light to the scene
        const pointLight = new THREE.PointLight(0xffffff, 3);
        pointLight.position.set(0, 5, 5);
        scene.add(pointLight);
        controls.update();
        const animate = () => {
            requestAnimationFrame(animate);

            renderer.render(scene, camera);
        };
        animate();

        const handleMouseMove = (event) => {
            mouseX.current = (event.clientX / canvasRef.current.clientWidth) * 2 - 1;
            mouseY.current = -(event.clientY / canvasRef.current.clientHeight) * 2 + 1;
        };

        canvasRef.current.addEventListener('mousemove', handleMouseMove);

        return () => {
            if(canvasRef.current){
                canvasRef.current.removeEventListener('mousemove', handleMouseMove);
            }
        };
    }, []);

    return <div >      

    <canvas ref = { canvasRef } />
    <RingLoader color={"red"}  style={{ position: 'absolute', left: '40%', top: '35%'}} loading={isLoading} />
    </div>;
};

export default GLBViewer;