# Crecer Grande Website V2.6 — Part 3 Research Notes

## Scope
Part 3 focuses on the 3D Printing & CAD Quotation System.

## External workflow references reviewed
- Xometry accepts STEP/STP, SLDPRT, STL, DXF, IPT, Parasolid, CATPART, PRT, SAT, 3MF and JT among other formats. Its guidance notes that mesh formats such as STL/3MF can require explicit unit handling, while solid CAD is useful beyond additive manufacturing.
- Protolabs' quoting workflow accepts multiple solid CAD formats and lets customers configure materials, secondary operations and finishing before manufacturing analysis.
- Craftcloud uses a drag-and-drop model upload workflow and supports STL, OBJ, 3MF, STEP/STP plus additional formats.
- Protolabs Network / Hubs emphasizes selecting a 3D process using required material properties, functional/visual requirements and the capabilities of the process; it also describes FDM, SLA, SLS and MJF as distinct routes with different trade-offs.

## Decisions for CG V2.6
1. Do not pretend the browser is a full production slicer.
2. Provide local geometry analysis for STL / OBJ / 3MF.
3. Ask for a mesh unit where the format may be ambiguous.
4. Accept STEP/STP and common solid CAD for engineering review without lossy browser conversion.
5. Do not calculate final price only by weight / ₹ per gram.
6. Use process + material + approximate geometry + layer + infill + complexity + quantity + secondary operations for a preliminary FDM/resin estimate.
7. Keep SLS, MJF, PolyJet and metal additive as engineering RFQ routes.
8. Include FAI, heat-set inserts, finishing and inspection as real manufacturing options.
9. Require customer contact data before final CAD submission.
10. Keep all website estimates explicitly preliminary and subject to engineering review.

## Brand / capability wording
Advanced additive processes are described as RFQ / specialist routes and not as owned in-house capability unless Crecer Grande later documents that capability.
