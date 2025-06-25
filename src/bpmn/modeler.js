import BpmnModeler from 'bpmn-js/lib/Modeler';
import BPMNAnalyzerModule from "@/extensions/modeler.js";

const introModel = `
<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="Definitions_0sj2cdl" targetNamespace="http://bpmn.io/schema/bpmn" exporter="bpmn-js (https://demo.bpmn.io)" exporterVersion="18.3.1">
  <bpmn:process id="Process_1tab2ea" isExecutable="false">
    <bpmn:startEvent id="StartEvent_1jdbf41">
      <bpmn:outgoing>Flow_064djtp</bpmn:outgoing>
    </bpmn:startEvent>
    <bpmn:task id="Activity_0o0itk6" name="Load submission">
      <bpmn:incoming>Flow_064djtp</bpmn:incoming>
      <bpmn:outgoing>Flow_1wjlrux</bpmn:outgoing>
    </bpmn:task>
    <bpmn:sequenceFlow id="Flow_064djtp" sourceRef="StartEvent_1jdbf41" targetRef="Activity_0o0itk6" />
    <bpmn:task id="Activity_1q0i8nu" name="Grade submission">
      <bpmn:incoming>Flow_1wjlrux</bpmn:incoming>
      <bpmn:outgoing>Flow_1o1fh2e</bpmn:outgoing>
    </bpmn:task>
    <bpmn:sequenceFlow id="Flow_1wjlrux" sourceRef="Activity_0o0itk6" targetRef="Activity_1q0i8nu" />
    <bpmn:intermediateThrowEvent id="Event_0swk3yz">
      <bpmn:incoming>Flow_1o1fh2e</bpmn:incoming>
    </bpmn:intermediateThrowEvent>
    <bpmn:sequenceFlow id="Flow_1o1fh2e" sourceRef="Activity_1q0i8nu" targetRef="Event_0swk3yz" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1tab2ea">
      <bpmndi:BPMNShape id="_BPMNShape_StartEvent_2" bpmnElement="StartEvent_1jdbf41">
        <dc:Bounds x="156" y="82" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_0o0itk6_di" bpmnElement="Activity_0o0itk6">
        <dc:Bounds x="250" y="60" width="100" height="80" />
        <bpmndi:BPMNLabel />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_1q0i8nu_di" bpmnElement="Activity_1q0i8nu">
        <dc:Bounds x="410" y="60" width="100" height="80" />
        <bpmndi:BPMNLabel />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Event_0swk3yz_di" bpmnElement="Event_0swk3yz">
        <dc:Bounds x="572" y="82" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="Flow_064djtp_di" bpmnElement="Flow_064djtp">
        <di:waypoint x="192" y="100" />
        <di:waypoint x="250" y="100" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_1wjlrux_di" bpmnElement="Flow_1wjlrux">
        <di:waypoint x="350" y="100" />
        <di:waypoint x="410" y="100" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_1o1fh2e_di" bpmnElement="Flow_1o1fh2e">
        <di:waypoint x="510" y="100" />
        <di:waypoint x="572" y="100" />
      </bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;

export async function createModeler(container, reference_xml) {
  let modeler = new BpmnModeler({
    container: container,
    additionalModules: [
      BPMNAnalyzerModule,
    ]
  })

  try {
    const { warnings } = await modeler.importXML(reference_xml);

    modeler.get('canvas').zoom("fit-viewport");

    if (warnings.length) {
      console.warn('Diagram loaded with warnings', warnings);
    }

    return modeler
  } catch (err) {
    console.error('Could not load diagram', err);
  }
}
