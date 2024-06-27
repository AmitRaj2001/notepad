import React, { useState } from "react";
import {
	Editor,
	EditorState,
	ContentState,
	convertFromRaw,
	convertToRaw,
} from "draft-js";
import "draft-js/dist/Draft.css";
import { jsPDF } from "jspdf";
import mammoth from "mammoth";
import pptxgen from "pptxgenjs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faSun,
	faMoon,
	faFilePdf,
	faUndo,
	faRedo,
	faUpload,
} from "@fortawesome/free-solid-svg-icons";

const Notepad = () => {
	const [editorState, setEditorState] = useState(EditorState.createEmpty());
	const [fontFamily, setFontFamily] = useState("Arial");
	const [fontSize, setFontSize] = useState(14);
	const [backgroundColor, setBackgroundColor] = useState("white");
	// If you're not using fileContent anywhere else, add the following comment to ignore the warning:
	// eslint-disable-next-line no-unused-vars
	const [fileContent, setFileContent] = useState(null);

	const handleSaveAsPdf = () => {
		const contentState = editorState.getCurrentContent();
		const rawContent = convertToRaw(contentState);

		const pdf = new jsPDF({
			orientation: "portrait",
			unit: "mm",
			format: "a4",
		});

		const pageWidth = pdf.internal.pageSize.getWidth();
		const pageHeight = pdf.internal.pageSize.getHeight();
		const lineHeight = 0.2; // Line height multiplier
		const margin = 10;
		let y = margin;

		rawContent.blocks.forEach((block) => {
			const lines = block.text.split("\n");
			lines.forEach((line, index) => {
				const textLines = pdf.splitTextToSize(
					line,
					pageWidth - 2 * margin
				);
				textLines.forEach((textLine, textIndex) => {
					if (y + lineHeight > pageHeight - margin) {
						pdf.addPage();
						y = margin;
					}
					if (textIndex === 0) {
						pdf.text(textLine, margin, y);
					} else {
						y += lineHeight * (fontSize / 10) * 12; // Adjust font size
						pdf.text(textLine, margin, y);
					}
					y += lineHeight * (fontSize / 10) * 12; // Line height
				});
			});
			y += lineHeight * (fontSize / 10) * 12; // Extra spacing between blocks
		});

		pdf.save("document.pdf");
	};

	const handleUndo = () => {
		setEditorState(EditorState.undo(editorState));
	};

	const handleRedo = () => {
		setEditorState(EditorState.redo(editorState));
	};

	const handleFileOpen = (event) => {
		const file = event.target.files[0];
		const fileType = file.type;

		const reader = new FileReader();

		reader.onload = async () => {
			if (fileType === "application/json") {
				const content = JSON.parse(reader.result);
				const contentState = convertFromRaw(content);
				setEditorState(EditorState.createWithContent(contentState));
			} else if (fileType === "application/pdf") {
				setFileContent(reader.result); // Set file content here
			} else if (
				fileType ===
				"application/vnd.openxmlformats-officedocument.wordprocessingml.document"
			) {
				const result = await mammoth.extractRawText({
					arrayBuffer: reader.result,
				});
				const contentState = ContentState.createFromText(result.value);
				setEditorState(EditorState.createWithContent(contentState));
			} else if (
				fileType ===
				"application/vnd.openxmlformats-officedocument.presentationml.presentation"
			) {
				const ppt = new pptxgen();
				ppt.load(file);
				const slidesText = ppt.slides
					.map((slide) => slide.notes)
					.join("\n\n");
				const contentState = ContentState.createFromText(slidesText);
				setEditorState(EditorState.createWithContent(contentState));
			} else {
				alert("Unsupported file type");
			}
		};

		reader.readAsArrayBuffer(file);
	};

	const handleFontSizeChange = (event) => {
		setFontSize(parseInt(event.target.value));
	};

	const handleFontFamilyChange = (event) => {
		setFontFamily(event.target.value);
	};

	const toggleTheme = () => {
		setBackgroundColor(backgroundColor === "white" ? "black" : "white");
	};

	const editorStyle = {
		minHeight: "260mm", // A4 size
		padding: "10px",
		border: "1px solid #ccc",
		overflowY: "auto",
		resize: "none",
		width: "100%",
		whiteSpace: "pre-wrap", // To wrap text
		fontFamily: fontFamily,
		fontSize: `${fontSize}px`,
	};

	const iconColor = backgroundColor === "black" ? "white" : "black";

	return (
		<div
			style={{
				backgroundColor: backgroundColor,
				color: iconColor,
				padding: "20px",
				fontFamily: fontFamily,
			}}
		>
			<div
				style={{
					display: "center",
					alignItems: "center",
					marginBottom: "10px",
				}}
			>
				<button className="icon-button" onClick={handleSaveAsPdf}>
					<FontAwesomeIcon icon={faFilePdf} />
				</button>

				<button className="icon-button" onClick={handleUndo}>
					<FontAwesomeIcon icon={faUndo} />
				</button>
				<button className="icon-button" onClick={handleRedo}>
					<FontAwesomeIcon icon={faRedo} />
				</button>
				<input
					type="file"
					accept=".json,.pdf,.docx,.pptx"
					onChange={handleFileOpen}
					style={{ display: "none" }}
					id="fileInput"
				/>
				<label htmlFor="fileInput" className="icon-button">
					<FontAwesomeIcon icon={faUpload} /> word
				</label>
				<select
					className="select-box"
					onChange={handleFontSizeChange}
					value={fontSize}
				>
					<option value={12}>12px</option>
					<option value={14}>14px</option>
					<option value={16}>16px</option>
					<option value={18}>18px</option>
					<option value={20}>20px</option>
					<option value={24}>24px</option>
					<option value={28}>28px</option>
					<option value={32}>32px</option>
				</select>
				<select
					className="select-box"
					onChange={handleFontFamilyChange}
					value={fontFamily}
				>
					<option value="Arial">Arial</option>
					<option value="Courier New">Courier New</option>
					<option value="Georgia">Georgia</option>
					<option value="Times New Roman">Times New Roman</option>
					<option value="Verdana">Verdana</option>
				</select>
				<button className="icon-button" onClick={toggleTheme}>
					{backgroundColor === "white" ? (
						<FontAwesomeIcon icon={faMoon} />
					) : (
						<FontAwesomeIcon icon={faSun} />
					)}
				</button>
			</div>
			<div style={{ marginTop: "10px" }}>
				<div style={editorStyle}>
					<Editor
						editorState={editorState}
						onChange={setEditorState}
					/>
				</div>
			</div>
		</div>
	);
};

export default Notepad;
