import React from "react";
import { View } from "react-native";

type CircleProps = {
    width: number;
    height: number;
    borderRadius: number;
    fillColor: string;
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
};

export default function CircleShape(props: CircleProps) {
    return (
        <View
            style={{
                position: "absolute",
                width: props.width,
                height: props.height,
                borderRadius: props.borderRadius,
                backgroundColor: props.fillColor,
                ...(props.top !== undefined && { top: props.top }),
                ...(props.bottom !== undefined && { bottom: props.bottom }),
                ...(props.left !== undefined && { left: props.left }),
                ...(props.right !== undefined && { right: props.right }),
            }}
        />
    );
}
