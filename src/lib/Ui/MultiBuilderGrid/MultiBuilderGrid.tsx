import React from "react";
import Grid from "../Grid/Grid";

type ButtonProps = {
    onClick: any;
    title: string;
    className?: string;
};

const Button = ({ onClick, title, className = "bg-red text-white" }: ButtonProps) => (
    <p className={`px-md py-sm rounded-lg pointer ${className}`} onClick={onClick}>
        {title}
    </p>
);

type MultiBuilderGridProps = {
    service: any;
    builders: any;
};

const MultiBuilderGrid = ({ service, builders }: MultiBuilderGridProps) => {
    [service.cardTemplate, service.setCardTemplate] = React.useState(localStorage.getItem(`${service.id}-builder`) || Object.keys(builders)[0]);
    return (
        <>
            <div className="row-center self-start gap-md bg-prim px-md rounded-lg py-sm mx-md">
                <p className="text-shark">Card Template : </p>

                {Object.keys(builders).map((card, i) => (
                    <Button
                        className={card === service.cardTemplate ? "bg-cyan text-black" : "bg-prince text-crow"}
                        key={i}
                        onClick={() => {
                            localStorage.setItem(`${service.id}-builder`, card);
                            service.setCardTemplate(card);
                        }}
                        title={`${card}`}
                    />
                ))}
            </div>
            <Grid service={service} itemBuilder={builders[service.cardTemplate]} />
        </>
    );
};

export default MultiBuilderGrid;
