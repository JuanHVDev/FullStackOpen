import { useEffect, useState } from "react";
import agenda from "./services/agenda";
import { AddPerson } from "./components/AddPerson";
import { FilterPerson } from "./components/FilterPerson";
import { NumbersPersons } from "./components/NumbersPersons";
const App = () => {
    const [persons, setPersons] = useState([]);
    const [newName, setNewName] = useState("");
    const [newPhone, setNewPhone] = useState("");
    const [personFilter, setPersonFilter] = useState("");
    const [mensaje, setMensaje] = useState(null);

    useEffect(() => {
        agenda.getAll().then((initialContacts) => setPersons(initialContacts));
    }, []);

    const onInputNameChange = (e) => {
        setNewName(e.target.value);
    };

    const onInputPhoneChange = (e) => {
        setNewPhone(e.target.value);
    };

    const onInputFilterChange = (e) => {
        setPersonFilter(e.target.value);
    };

    const addPerson = (e) => {
        e.preventDefault();
        const persona = {
            name: newName,
            number: newPhone,
        };
        if (
            persons.filter((person) => person.name === persona.name).length > 0
        ) {
            if (
                window.confirm(
                    `${persona.name} ya está registrado,deseas actualizarlo?`
                )
            ) {
                const personaPrevia = persons.find(
                    (n) => n.name === persona.name
                );
                agenda
                    .update(personaPrevia.id, {
                        ...personaPrevia,
                        number: newPhone,
                    })
                    .then((updatePersona) => {
                        setPersons(
                            persons.map((n) =>
                                n.name === newName ? updatePersona : n
                            )
                        );
                        setMensaje("El contacto ha sido actualizado");
                    })
                    .catch((err) => console.log(err));
            }
            setPersons(persons.concat(persona));
            setNewName("");
            setNewPhone("");
            setMensaje("Agregado nueva persona");
        } else {
            agenda.create(persona).then((returnedContact) => {
                setPersons(persons.concat(returnedContact));
                setNewName("");
                setNewPhone("");
                setMensaje("El contacto se ha creado");
            });
        }
    };

    const deletePerson = (name, id) => {
        if (window.confirm(`Delete a ${name}?`)) {
            agenda
                .deleteContact(id)
                .then(() => {
                    console.log("Delete");
                    setPersons(persons.filter((n) => n.id !== id));
                    setNewName("");
                    setNewPhone("");
                    setMensaje("El contacto se ha eliminado");
                })
                .catch((error) => {
                    setPersons(persons.filter((n) => n.name !== name));
                    console.log(error);
                });
        }
    };

    return (
        <div>
            <h2>Phonebook</h2>
            <FilterPerson
                personFilter={personFilter}
                onInputFilterChange={onInputFilterChange}
            />
            <h2>Add a new</h2>
            <AddPerson
                addPerson={addPerson}
                newName={newName}
                newPhone={newPhone}
                onInputNameChange={onInputNameChange}
                onInputPhoneChange={onInputPhoneChange}
            />
            <h2>Numbers</h2>
            <NumbersPersons
                deleteContact={deletePerson}
                persons={persons}
                personFilter={personFilter}
            />
        </div>
    );
};

export default App;
