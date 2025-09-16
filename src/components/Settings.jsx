import React, { useState, useEffect } from 'react';
import './Settings.css';
import { fetchPreferences, updatePreferences } from '../services/updatePreferences';
import { auth } from '../firebaseConfig';
import Swal from "sweetalert2";

const Settings = ({triggerRefresh, setTriggerRefresh}) => {
  const [fields, setFields] = useState({});
  const [cName, setCName] = useState('');
  const [newFieldInputVisible, setNewFieldInputVisible] = useState(false);
  const [newFieldName, setNewFieldName] = useState('');
  const [inputVisibleFor, setInputVisibleFor] = useState({});
  const [newValues, setNewValues] = useState({});

  useEffect(() => {
    const getUserPreferences = async () => {
      try {
        const userId = auth.currentUser.uid;
        const preferences = await fetchPreferences(userId);
        if (preferences) {
          setCName(preferences.cName);
          setFields(preferences.fields);
        }
      } catch (err) {
        console.log('Error fetching preferences:', err);
      }
    };

    getUserPreferences();
  }, []);

  const showValueInput = (fieldKey) => {
    setInputVisibleFor({ ...inputVisibleFor, [fieldKey]: true });
  };

  const handleAddValueToField = (fieldKey) => {
    const newValue = newValues[fieldKey]?.trim();
    if (newValue && !fields[fieldKey].includes(newValue)) {
      setFields({
        ...fields,
        [fieldKey]: [...fields[fieldKey], newValue],
      });
    }
    setNewValues({ ...newValues, [fieldKey]: '' });
    setInputVisibleFor({ ...inputVisibleFor, [fieldKey]: false });
  };

  const handleAddNewField = () => {
    const key = newFieldName.trim();
    if (key && !fields.hasOwnProperty(key)) {
      setFields({ ...fields, [key]: [] });
    }
    setNewFieldName('');
    setNewFieldInputVisible(false);
  };

  const handleSavePreferences = async () => {
    try {
      const userId = auth.currentUser.uid;
      await updatePreferences(userId, cName, fields);
      setTriggerRefresh(!triggerRefresh)
     Swal.fire({
             icon: "success",
             title: "✔️ Preferences Updated!",
             showConfirmButton: false,
             timer: 800,
           });
    } catch (err) {
      alert('Failed to save preferences. Check console for details.');
      console.log(err);
    }
  };

  const handleRemoveValue = (fieldKey, valueToRemove) => {
    const updatedFields = { ...fields };
  
    if (Array.isArray(updatedFields[fieldKey])) {
      updatedFields[fieldKey] = updatedFields[fieldKey].filter(val => val !== valueToRemove);
  
      setFields(updatedFields); // Update state
      updatePreferences(userId, cName, updatedFields); // Call your existing function
    }
  };
  

  return (
    <div className="settingsPage">
      <h1 style={{ fontWeight: '500', marginBottom: '30px' }}>Edit your preferences</h1>

      {/* Company Name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
        <h2>Company Name</h2>
        <input
          className="companyNameBox"
          type="text"
          value={cName}
          onChange={(e) => setCName(e.target.value)}
        />
      </div>

      {/* Fields Section */}
      <div style={{ marginTop: '40px' }}>
        <h2>Fields</h2>

        <div className='field-details'>
          {Object.entries(fields).map(([key, values]) => (
            <div key={key} style={{ marginBottom: '20px' }}>
              <div style={{fontSize: '18px',alignItems:'center',display:'flex' }}><i className="fa-solid fa-circle" style={{fontSize:'7px',marginRight:'10px'}}></i>{key}</div>
              <ul className="fieldItems" style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                {Array.isArray(values) &&
                  values.map((val, idx) => (
                    <div className='field-items-div' key={val}>
                      <li>{val}</li>
                      <button className='remove-item-btn'onClick={()=>handleRemoveValue(key, val)}>  <i className='fa-solid fa-close'></i></button>
                    </div>
                  ))}
                <li className='plus-item'
                  style={{ cursor: 'pointer' }}
                  onClick={() => showValueInput(key)}
                >
                  <i className="fa-solid fa-plus"></i>
                </li>
              </ul>
  
              {inputVisibleFor[key] && (
                <div style={{ display: 'flex', gap: '1px', marginTop: '5px' }}>
                  <input
                  className='add-item-field'
                    type="text"
                    placeholder={`Add to ${key}`}
                    value={newValues[key] || ''}
                    onChange={(e) => setNewValues({ ...newValues, [key]: e.target.value })}
                  />
                  <button style={{background:'none',border:'none'}} onClick={() => handleAddValueToField(key)}><i class="fa-solid fa-circle-check"></i></button>
                </div>
              )}
            </div>
          ))}
  
        </div>
        {/* Add New Field Button */}
        <div className='setting-edit-btns'>
          {!newFieldInputVisible ? (
            <button onClick={() => setNewFieldInputVisible(true)} className="FieldBtn field-btn-add">
              Add New Field
            </button>
          ) : (
            <div style={{ marginTop: '10px', display: 'flex', gap: '1px' }}>
              <input
              className='add-item-field'
                type="text"
                placeholder="New field name"
                value={newFieldName}
                onChange={(e) => setNewFieldName(e.target.value)}
              />
              <button style={{background:'none',border:'none'}} onClick={handleAddNewField}><i className="fa-solid fa-circle-check"></i></button>
            </div>
          )}
  
          {/* Save Button */}
          
            <button className="FieldBtn field-btn-save" onClick={handleSavePreferences}>Save Preferences</button>
      
        </div>
      </div>
    </div>
  );
};

export default Settings;
