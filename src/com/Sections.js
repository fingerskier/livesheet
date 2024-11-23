import { useEffect, useState } from 'react'
import styles from './Sections.module.css'


export default function Sections({ data }) {
  const [sections, setSections] = useState(data || []);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [deleteIndex, setDeleteIndex] = useState(null);

  const addSection = () => {
    setSections([...sections, { name: '', chords: '', lyrics: '' }]);
  };

  const updateSection = (index, field, value) => {
    const updatedSections = sections.map((section, i) => {
      if (i === index) {
        return { ...section, [field]: value };
      }
      return section;
    });
    setSections(updatedSections);
  }
  
  
  const removeSection = (index) => {
    return event => {
      event.preventDefault()
      setSections(sections.filter((_, i) => i !== index))
      setDeleteIndex(null)
      return false
    }
  }
  
  
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    // Make the drag image transparent
    const dragImage = e.target.cloneNode(true);
    dragImage.style.opacity = '0.5';
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 0, 0);
    setTimeout(() => document.body.removeChild(dragImage), 0);
  }
  
  
  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null) return;
    
    const newSections = [...sections];
    const draggedSection = newSections[draggedIndex];
    newSections.splice(draggedIndex, 1);
    newSections.splice(index, 0, draggedSection);
    
    setSections(newSections);
    setDraggedIndex(index);
  }
  
  
  const handleDragEnd = () => {
    setDraggedIndex(null);
  }
  
  
  return <div className={styles.sections}>
    <h2 className={styles.header}>Sections</h2>
    
    <div className={styles.section}>
      {sections.map((section, index) => (
        <div 
          key={index}
          className={`draggable ${
            draggedIndex === index ? 'border-blue-500 bg-blue-50' : ''
          }`}
          draggable
          onDragStart={(e) => handleDragStart(e, index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragEnd={handleDragEnd}
        >
          <div className={styles.slug}>
            <div className={styles.grip}
              onDragStart={(e) => handleDragStart(e, index)}
            >
              ⠿
            </div>
            
            <div className={styles.name}>
              <input placeholder="Section Name..." type="text"
                value={section.name}
                onChange={(e) => updateSection(index, 'name', e.target.value)}
              />
            </div>
            
            <button className={styles.delete} type="button"
              onClick={removeSection(index)}
            >
              ❌
            </button>
          </div>
          
          <div>
            <div className={styles.chords}>
              <label> Chords </label>
              
              <input placeholder="Enter chords..." type="text"
                value={section.chords}
                onChange={(e) => updateSection(index, 'chords', e.target.value)}
              />
            </div>
            
            <div className={styles.lyrics}>
              <label> Lyrics </label>
              
              <textarea placeholder="Enter lyrics..."
                onChange={(e) => updateSection(index, 'lyrics', e.target.value)}
                rows={3}
                value={section.lyrics}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
    
    <button className={styles.add} type="button"
      onClick={addSection}
    >
      Add Section
    </button>
    
    <input name="sections" type="hidden" 
      value={JSON.stringify(sections)} 
    />
  </div>
}