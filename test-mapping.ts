import { dataService } from '@/services/dataService';

async function testMapping() {
  console.log('Testing question type mapping...');
  
  // Test GMAT quantitative
  const gmatQuant = await dataService.getRandomQuestion({
    exam: 'GMAT',
    type: 'quantitative' // UI sends this
  });
  console.log('GMAT quantitative:', gmatQuant ? { id: gmatQuant.id, type: gmatQuant.type } : 'null');
  
  // Test LSAT logical
  const lsatLogical = await dataService.getRandomQuestion({
    exam: 'LSAT', 
    type: 'logical' // UI sends this
  });
  console.log('LSAT logical:', lsatLogical ? { id: lsatLogical.id, type: lsatLogical.type } : 'null');
  
  // Test LSAT reading
  const lsatReading = await dataService.getRandomQuestion({
    exam: 'LSAT',
    type: 'reading' // UI sends this  
  });
  console.log('LSAT reading:', lsatReading ? { id: lsatReading.id, type: lsatReading.type } : 'null');
}

testMapping();
