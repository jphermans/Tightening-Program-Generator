import React, { useState } from 'react';
    import { Container, TextField, Button, Typography, Paper, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, FormControlLabel, Switch } from '@mui/material';

    // Speed recommendations based on bolt size and material
    const speedRecommendations = {
      '8.8': {
        min: 50,
        max: 200
      },
      '10.9': {
        min: 30,
        max: 150
      },
      '12.9': {
        min: 20,
        max: 100
      }
    };

    function generateTighteningProgram(steps, boltLength, pitch, boltClass, partThickness, useAngle, angleDegrees, snugTorque, finalTorque) {
      // Convert all inputs to numbers
      steps = Number(steps);
      boltLength = Number(boltLength);
      pitch = Number(pitch);
      partThickness = Number(partThickness);
      angleDegrees = Number(angleDegrees);
      snugTorque = Number(snugTorque);
      finalTorque = Number(finalTorque);

      const program = [];
      const speedRange = speedRecommendations[boltClass];
      
      // Calculate effective bolt length (total length - part thickness)
      const effectiveLength = boltLength - partThickness;
      
      // Calculate rundown angle (360° per pitch * effective length)
      const rundownAngle = Math.round((360 / pitch) * effectiveLength);
      
      // Add rundown as step 1
      program.push({
        step: 1,
        target: '0 Nm',
        angle: `${rundownAngle}°`,
        speed: `${speedRange.max} rpm`,
        tolerance: 'N/A',
        description: 'Rundown phase (fast)'
      });
      
      // Calculate remaining steps
      const remainingSteps = steps - 2; // Subtract 1 for rundown and 1 for final
      const stepTorque = useAngle ? snugTorque : finalTorque / (remainingSteps + 1);
      
      // Add intermediate torque steps
      for (let i = 1; i <= remainingSteps; i++) {
        const target = stepTorque * i;
        const speed = Math.max(
          speedRange.min,
          speedRange.max - (i * ((speedRange.max - speedRange.min) / remainingSteps))
        );
        
        program.push({
          step: i + 1,
          target: `${target.toFixed(2)} Nm`,
          angle: 'N/A',
          speed: `${Math.round(speed)} rpm`,
          tolerance: `±${(target * 0.1).toFixed(2)} Nm`,
          description: `Torque step ${i}`
        });
      }
      
      // Add final step based on strategy
      if (useAngle) {
        // Angle-based final step
        program.push({
          step: steps,
          target: `${angleDegrees}°`,
          angle: `${angleDegrees}°`,
          speed: `${speedRange.min} rpm`,
          tolerance: `±${(angleDegrees * 0.1).toFixed(1)}°`,
          description: `Final angle tightening (slow)`
        });
      } else {
        // Torque-based final step
        program.push({
          step: steps,
          target: `${finalTorque.toFixed(2)} Nm`,
          angle: 'N/A',
          speed: `${speedRange.min} rpm`,
          tolerance: `±${(finalTorque * 0.1).toFixed(2)} Nm`,
          description: `Final torque (slow)`
        });
      }
      
      return program;
    }

    function App() {
      const [inputs, setInputs] = useState({
        steps: 3,
        boltLength: 50,
        pitch: 1.5,
        boltClass: '8.8',
        partThickness: 10,
        useAngle: false,
        angleDegrees: 90,
        snugTorque: 50,
        finalTorque: 100
      });
      
      const [program, setProgram] = useState([]);

      const handleGenerate = () => {
        if (inputs.steps < 2) {
          alert('Minimum 2 steps required (rundown + final step)');
          return;
        }
        
        if (inputs.partThickness >= inputs.boltLength) {
          alert('Part thickness must be less than bolt length');
          return;
        }
        
        const program = generateTighteningProgram(
          inputs.steps,
          inputs.boltLength,
          inputs.pitch,
          inputs.boltClass,
          inputs.partThickness,
          inputs.useAngle,
          inputs.angleDegrees,
          inputs.snugTorque,
          inputs.finalTorque
        );
        setProgram(program);
      };

      const handleInputChange = (e) => {
        setInputs({
          ...inputs,
          [e.target.name]: e.target.value
        });
      };

      return (
        <Container maxWidth="md" sx={{ mt: 4 }}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
              Tightening Program Generator
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  select
                  fullWidth
                  name="boltClass"
                  label="Bolt Class"
                  value={inputs.boltClass}
                  onChange={handleInputChange}
                  SelectProps={{ native: true }}
                >
                  <option value="8.8">8.8</option>
                  <option value="10.9">10.9</option>
                  <option value="12.9">12.9</option>
                </TextField>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  type="number"
                  name="steps"
                  label="Number of Steps"
                  value={inputs.steps}
                  onChange={handleInputChange}
                  inputProps={{ min: 2 }}
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  type="number"
                  name="boltLength"
                  label="Bolt Length (mm)"
                  value={inputs.boltLength}
                  onChange={handleInputChange}
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  type="number"
                  name="pitch"
                  label="Pitch (mm)"
                  value={inputs.pitch}
                  onChange={handleInputChange}
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  type="number"
                  name="partThickness"
                  label="Part Thickness (mm)"
                  value={inputs.partThickness}
                  onChange={handleInputChange}
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  type="number"
                  name="snugTorque"
                  label="Snug Torque (Nm)"
                  value={inputs.snugTorque}
                  onChange={handleInputChange}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={inputs.useAngle}
                      onChange={(e) => setInputs({
                        ...inputs,
                        useAngle: e.target.checked
                      })}
                    />
                  }
                  label="Use Angle Tightening"
                />
              </Grid>
              
              {inputs.useAngle ? (
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="number"
                    name="angleDegrees"
                    label="Final Angle (degrees)"
                    value={inputs.angleDegrees}
                    onChange={handleInputChange}
                  />
                </Grid>
              ) : (
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="number"
                    name="finalTorque"
                    label="Final Torque (Nm)"
                    value={inputs.finalTorque}
                    onChange={handleInputChange}
                  />
                </Grid>
              )}
              
              <Grid item xs={12}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleGenerate}
                  sx={{ py: 2 }}
                >
                  Generate Tightening Program
                </Button>
              </Grid>
              
              {program.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                    Tightening Program:
                  </Typography>
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Step</TableCell>
                          <TableCell>Target</TableCell>
                          <TableCell>Angle</TableCell>
                          <TableCell>Speed</TableCell>
                          <TableCell>Tolerance</TableCell>
                          <TableCell>Description</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {program.map((step, index) => (
                          <TableRow key={index}>
                            <TableCell>{step.step}</TableCell>
                            <TableCell>{step.target}</TableCell>
                            <TableCell>{step.angle}</TableCell>
                            <TableCell>{step.speed}</TableCell>
                            <TableCell>{step.tolerance}</TableCell>
                            <TableCell>{step.description}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              )}
            </Grid>
          </Paper>
        </Container>
      );
    }

    export default App;
