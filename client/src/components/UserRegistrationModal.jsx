import React, { useState } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import { colonias } from '../data/colonias';

const UserRegistrationModal = ({ show, onComplete }) => {
  const [nombre, setNombre] = useState('');
  const [colonia, setColonia] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!nombre.trim()) {
      setError('Por favor ingresa tu nombre');
      return;
    }

    if (!colonia) {
      setError('Por favor selecciona tu colonia');
      return;
    }

    // Guardar en localStorage
    const userData = {
      nombre: nombre.trim(),
      colonia: colonia,
      registeredAt: new Date().toISOString()
    };

    localStorage.setItem('pozoMinervaUser', JSON.stringify(userData));
    onComplete(userData);
  };

  return (
    <Modal
      show={show}
      backdrop="static"
      keyboard={false}
      centered
      size="md"
    >
      <Modal.Header>
        <Modal.Title>Bienvenido al Sitio del Pozo de Minerva</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="mb-4">
          Para participar en el chat comunitario, por favor identifícate con tu nombre y colonia.
        </p>

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Tu Nombre</Form.Label>
            <Form.Control
              type="text"
              placeholder="Ej: Juan Pérez"
              value={nombre}
              onChange={(e) => {
                setNombre(e.target.value);
                setError('');
              }}
              maxLength={50}
              autoFocus
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Tu Colonia</Form.Label>
            <Form.Select
              value={colonia}
              onChange={(e) => {
                setColonia(e.target.value);
                setError('');
              }}
            >
              <option value="">Selecciona tu colonia...</option>
              {colonias.map((col) => (
                <option key={col.value} value={col.value}>
                  {col.label}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          {error && (
            <div className="alert alert-danger py-2">{error}</div>
          )}

          <Button
            variant="primary"
            type="submit"
            className="w-100"
            size="lg"
          >
            Continuar al Sitio
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default UserRegistrationModal;
