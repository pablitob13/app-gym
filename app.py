import streamlit as st
import json
import os
import uuid
import datetime
from typing import List, Dict, Any, Optional

# --- CONFIGURACIÓN DE PÁGINA ---
st.set_page_config(page_title="Gym Tracker", page_icon="🏋️", layout="centered")

# --- ARCHIVOS DE PERSISTENCIA ---
ROUTINES_FILE = "routines.json"
WORKOUTS_FILE = "workouts.json"

# --- PLANTILLAS INICIALES POR DEFECTO ---
DEFAULT_ROUTINES = [
    {
        "id": "routine-torso",
        "name": "Día de Torso (Pecho y Espalda)",
        "exercises": [
            {"id": "ex-1", "name": "Press banca con barra", "default_sets": 4},
            {"id": "ex-2", "name": "Remo con barra", "default_sets": 4},
            {"id": "ex-3", "name": "Press inclinado con mancuernas", "default_sets": 3},
            {"id": "ex-4", "name": "Jalón al pecho", "default_sets": 3},
            {"id": "ex-5", "name": "Extensión de tríceps en polea", "default_sets": 3},
        ],
    },
    {
        "id": "routine-pierna",
        "name": "Día de Pierna y Core",
        "exercises": [
            {"id": "ex-6", "name": "Sentadilla trasera", "default_sets": 4},
            {"id": "ex-7", "name": "Peso muerto rumano", "default_sets": 4},
            {"id": "ex-8", "name": "Prensa de piernas", "default_sets": 3},
            {"id": "ex-9", "name": "Elevación de gemelos", "default_sets": 4},
            {"id": "ex-10", "name": "Plancha abdominal", "default_sets": 3},
        ],
    },
    {
        "id": "routine-hombro-brazo",
        "name": "Día de Hombro y Brazos",
        "exercises": [
            {"id": "ex-11", "name": "Press militar con mancuernas", "default_sets": 4},
            {"id": "ex-12", "name": "Elevaciones laterales", "default_sets": 4},
            {"id": "ex-13", "name": "Curl de bíceps con barra Z", "default_sets": 3},
            {"id": "ex-14", "name": "Fondos en paralelas", "default_sets": 3},
        ],
    },
]

# --- FUNCIONES DE ALMACENAMIENTO ---
def load_routines() -> List[Dict[str, Any]]:
    if not os.path.exists(ROUTINES_FILE):
        save_routines(DEFAULT_ROUTINES)
        return DEFAULT_ROUTINES
    try:
        with open(ROUTINES_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            return data if isinstance(data, list) else []
    except Exception:
        return []

def save_routines(routines: List[Dict[str, Any]]) -> None:
    with open(ROUTINES_FILE, "w", encoding="utf-8") as f:
        json.dump(routines, f, ensure_ascii=False, indent=2)

def load_workouts() -> List[Dict[str, Any]]:
    if not os.path.exists(WORKOUTS_FILE):
        return []
    try:
        with open(WORKOUTS_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            return data if isinstance(data, list) else []
    except Exception:
        return []

def save_workouts(workouts: List[Dict[str, Any]]) -> None:
    with open(WORKOUTS_FILE, "w", encoding="utf-8") as f:
        json.dump(workouts, f, ensure_ascii=False, indent=2)

# --- HISTORIAL DINÁMICO ---
def get_exercise_last_history(exercise_name: str, workouts: List[Dict[str, Any]], current_workout_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
    """
    Busca el último registro completado de este ejercicio en orden cronológico inverso.
    Retorna la fecha, hora, nombre de rutina y las series realizadas.
    """
    clean_target = exercise_name.strip().lower()
    if not clean_target:
        return None

    # Ordenar de más reciente a más antiguo
    sorted_workouts = sorted(
        workouts,
        key=lambda w: (w.get("date", ""), w.get("time", "")),
        reverse=True
    )

    for w in sorted_workouts:
        if current_workout_id and w.get("id") == current_workout_id:
            continue
        for ex in w.get("exercises", []):
            if ex.get("name", "").strip().lower() == clean_target:
                sets = ex.get("sets", [])
                if sets:
                    return {
                        "date": w.get("date", ""),
                        "time": w.get("time", ""),
                        "routine_name": w.get("routine_name", ""),
                        "sets": sets,
                    }
    return None

# --- ESTILOS DE DISEÑO TIPO APP DE NOTAS ---
st.markdown(
    """
    <style>
    /* Estética limpia y minimalista */
    .note-block {
        background-color: var(--secondary-background-color);
        border: 1px solid rgba(128, 128, 128, 0.2);
        border-radius: 10px;
        padding: 16px;
        margin-bottom: 16px;
    }
    .exercise-card {
        background: rgba(128, 128, 128, 0.05);
        border: 1px solid rgba(128, 128, 128, 0.18);
        border-radius: 8px;
        padding: 14px;
        margin-top: 14px;
        margin-bottom: 14px;
    }
    .history-text {
        color: #718096;
        font-size: 0.85rem;
        margin-top: -6px;
        margin-bottom: 10px;
    }
    .hint-gray {
        color: #888888;
        font-size: 0.78rem;
        margin-top: -8px;
    }
    .summary-chip {
        display: inline-block;
        padding: 3px 10px;
        border-radius: 12px;
        font-size: 0.8rem;
        font-weight: 600;
        margin-right: 6px;
    }
    </style>
    """,
    unsafe_allow_html=True,
)

# --- CABECERA ---
st.title("🏋️ Gym Tracker")
st.caption("Bloc de notas de entrenamiento personal · Sencillo, directo y sin distracciones")

# --- PESTAÑAS PRINCIPALES ---
tab_routines, tab_calendar = st.tabs(["📋 Mis Rutinas", "📅 Calendario y Registro"])

# ==============================================================================
# PESTAÑA 1: 📋 MIS RUTINAS
# ==============================================================================
with tab_routines:
    st.subheader("📋 Mis Rutinas")
    st.write("Crea, organiza y edita tus rutinas como páginas de un bloc de notas.")

    routines = load_routines()

    # Formulario para crear nueva rutina
    with st.expander("➕ Crear nueva rutina", expanded=False):
        with st.form("form_create_routine", clear_on_submit=True):
            new_routine_name = st.text_input("Nombre de la nueva rutina:", placeholder="ej: Día de Pierna, Espalda y Bíceps...")
            submitted = st.form_submit_button("Crear Rutina", type="primary")
            if submitted:
                clean_name = new_routine_name.strip()
                if clean_name:
                    routines.append({
                        "id": str(uuid.uuid4()),
                        "name": clean_name,
                        "exercises": []
                    })
                    save_routines(routines)
                    st.success(f"Rutina '{clean_name}' creada.")
                    st.rerun()
                else:
                    st.error("Por favor, introduce un nombre para la rutina.")

    st.write("")

    if not routines:
        st.info("No tienes ninguna rutina creada. ¡Pulsa en 'Crear nueva rutina' para comenzar!")
    else:
        for r_idx, routine in enumerate(routines):
            routine_id = routine.get("id", str(r_idx))
            r_name = routine.get("name", "Rutina sin nombre")
            exercises = routine.get("exercises", [])

            with st.expander(f"📝 {r_name}  ·  ({len(exercises)} ejercicios)", expanded=False):
                # 1. Renombrar o Borrar la Rutina
                col_rname, col_rdel = st.columns([3, 1])
                with col_rname:
                    new_r_name_input = st.text_input("Renombrar rutina:", value=r_name, key=f"rename_input_{routine_id}")
                    if new_r_name_input != r_name:
                        if st.button("Guardar nuevo nombre", key=f"btn_save_rname_{routine_id}"):
                            routine["name"] = new_r_name_input.strip()
                            save_routines(routines)
                            st.success("Nombre actualizado.")
                            st.rerun()

                with col_rdel:
                    st.write("")
                    st.write("")
                    if st.button("🗑️ Borrar Rutina", key=f"btn_del_r_{routine_id}", type="secondary", help="Eliminar rutina por completo"):
                        routines = [r for r in routines if r.get("id") != routine_id]
                        save_routines(routines)
                        st.warning("Rutina eliminada.")
                        st.rerun()

                st.markdown("---")
                st.markdown("##### Ejercicios configurados")

                if not exercises:
                    st.caption("Esta rutina aún no tiene ejercicios.")
                else:
                    for ex_idx, ex in enumerate(exercises):
                        c_ex_name, c_ex_sets, c_ex_del = st.columns([3, 2, 1])
                        with c_ex_name:
                            edited_ex_name = st.text_input(
                                f"Ejercicio {ex_idx + 1}",
                                value=ex.get("name", ""),
                                key=f"edit_ex_name_{routine_id}_{ex_idx}",
                                label_visibility="collapsed"
                            )
                            if edited_ex_name != ex.get("name", ""):
                                ex["name"] = edited_ex_name.strip()
                                save_routines(routines)
                        with c_ex_sets:
                            edited_ex_sets = st.number_input(
                                f"Series {ex_idx + 1}",
                                min_value=1,
                                max_value=20,
                                value=int(ex.get("default_sets", 3)),
                                step=1,
                                key=f"edit_ex_sets_{routine_id}_{ex_idx}",
                                label_visibility="collapsed"
                            )
                            if edited_ex_sets != ex.get("default_sets"):
                                ex["default_sets"] = int(edited_ex_sets)
                                save_routines(routines)
                        with c_ex_del:
                            if st.button("❌", key=f"del_ex_btn_{routine_id}_{ex_idx}", help="Eliminar ejercicio"):
                                routine["exercises"].pop(ex_idx)
                                save_routines(routines)
                                st.rerun()

                # Añadir ejercicio a esta rutina
                st.markdown("##### ➕ Añadir ejercicio a esta rutina")
                with st.form(f"form_add_ex_to_{routine_id}", clear_on_submit=True):
                    col_new_ex, col_new_sets, col_add_btn = st.columns([3, 2, 1.5])
                    with col_new_ex:
                        add_name = st.text_input("Nombre del ejercicio", placeholder="ej: Press militar, Dominadas...")
                    with col_new_sets:
                        add_sets = st.number_input("Series por defecto", min_value=1, max_value=20, value=3, step=1)
                    with col_add_btn:
                        st.write("")
                        st.write("")
                        btn_submitted = st.form_submit_button("Añadir", type="primary")

                    if btn_submitted:
                        clean_ex_name = add_name.strip()
                        if clean_ex_name:
                            routine.setdefault("exercises", []).append({
                                "id": str(uuid.uuid4()),
                                "name": clean_ex_name,
                                "default_sets": int(add_sets),
                            })
                            save_routines(routines)
                            st.success(f"'{clean_ex_name}' añadido.")
                            st.rerun()
                        else:
                            st.error("Indica el nombre del ejercicio.")

# ==============================================================================
# PESTAÑA 2: 📅 CALENDARIO Y REGISTRO
# ==============================================================================
with tab_calendar:
    st.subheader("📅 Calendario y Registro")

    workouts = load_workouts()
    routines = load_routines()

    # Selector de fecha
    col_d1, col_d2 = st.columns([2, 3])
    with col_d1:
        selected_date = st.date_input(
            "Selecciona fecha:",
            value=datetime.date.today(),
            format="DD/MM/YYYY"
        )
    selected_date_str = str(selected_date)

    # Filtrar sesiones del día seleccionado (permite más de 1 por día)
    day_workouts = [w for w in workouts if w.get("date") == selected_date_str]

    with col_d2:
        st.write("")
        st.write("")
        if not day_workouts:
            st.info(f"⚪ Sin entrenamientos el {selected_date.strftime('%d/%m/%Y')}")
        elif len(day_workouts) == 1:
            st.success(f"🟢 1 entrenamiento registrado ({selected_date.strftime('%d/%m/%Y')})")
        else:
            st.success(f"🟢 {len(day_workouts)} entrenamientos registrados ({selected_date.strftime('%d/%m/%Y')})")

    # Mostrar las sesiones ya registradas en ese día
    if day_workouts:
        with st.expander(f"📖 Ver entrenamientos del día ({len(day_workouts)})", expanded=True):
            for w_idx, workout in enumerate(day_workouts):
                w_id = workout.get("id", str(w_idx))
                r_title = workout.get("routine_name") or "Entrenamiento"
                w_time = workout.get("time", "")

                st.markdown(f"#### 🏋️ {r_title} {f'· 🕒 {w_time}' if w_time else ''}")
                if workout.get("notes"):
                    st.caption(f"📝 **Sensaciones/Notas:** {workout.get('notes')}")

                for ex in workout.get("exercises", []):
                    sets = ex.get("sets", [])
                    st.write(f"**{ex.get('name')}** ({len(sets)} series)")
                    set_bullets = []
                    for s_idx, s in enumerate(sets):
                        peso = s.get("weight", 0.0)
                        reps = s.get("reps", 0)
                        nota = f" — *{s.get('notes')}*" if s.get("notes") else ""
                        set_bullets.append(f"Serie {s_idx + 1}: **{peso} kg** × **{reps} reps**{nota}")
                    st.markdown(" • " + "  |  ".join(set_bullets))

                col_w_del, _ = st.columns([2, 4])
                with col_w_del:
                    if st.button("🗑️ Eliminar este entrenamiento", key=f"del_wk_{w_id}", type="secondary"):
                        workouts = [w for w in workouts if w.get("id") != w_id]
                        save_workouts(workouts)
                        st.warning("Entrenamiento eliminado.")
                        st.rerun()
                st.divider()

    st.write("---")

    # GESTIÓN DEL ESTADO DE SESIÓN ACTIVA
    if "active_workout" not in st.session_state:
        st.session_state.active_workout = None

    def sync_active_workout_from_widgets():
        """Sincroniza valores escritos en la interfaz hacia st.session_state.active_workout"""
        session = st.session_state.active_workout
        if not session:
            return
        s_id = session.get("id")

        if f"input_rname_{s_id}" in st.session_state:
            session["routine_name"] = st.session_state[f"input_rname_{s_id}"].strip()
        if f"input_rnotes_{s_id}" in st.session_state:
            session["notes"] = st.session_state[f"input_rnotes_{s_id}"].strip()

        for ex_idx, ex in enumerate(session.get("exercises", [])):
            ex_name_key = f"input_ex_name_{s_id}_{ex_idx}"
            if ex_name_key in st.session_state:
                ex["name"] = st.session_state[ex_name_key].strip()

            for set_idx, s in enumerate(ex.get("sets", [])):
                w_key = f"w_{s_id}_{ex_idx}_{set_idx}"
                r_key = f"r_{s_id}_{ex_idx}_{set_idx}"
                n_key = f"n_{s_id}_{ex_idx}_{set_idx}"

                if w_key in st.session_state:
                    s["weight"] = float(st.session_state[w_key])
                if r_key in st.session_state:
                    s["reps"] = int(st.session_state[r_key])
                if n_key in st.session_state:
                    s["notes"] = str(st.session_state[n_key]).strip()

    # Si NO hay sesión activa en progreso:
    if st.session_state.active_workout is None:
        st.markdown("### ➕ Añadir Sesión")
        st.write("Selecciona una rutina de tu lista o empieza un entrenamiento en blanco:")

        col_sel, col_start_btn = st.columns([3, 2])
        routine_options = [r.get("name", "Sin nombre") for r in routines] + ["Empezar en blanco"]

        with col_sel:
            selected_template = st.selectbox(
                "Rutina a realizar:",
                options=routine_options,
                help="Elige una rutina creada en la Pestaña 1 o inicia una sesión libre"
            )

        with col_start_btn:
            st.write("")
            st.write("")
            if st.button("➕ Añadir Sesión", type="primary", use_container_width=True):
                workout_id = str(uuid.uuid4())
                current_time = datetime.datetime.now().strftime("%H:%M")

                is_blank = (selected_template == "Empezar en blanco")
                new_session = {
                    "id": workout_id,
                    "date": selected_date_str,
                    "time": current_time,
                    "routine_name": "Entrenamiento Libre" if is_blank else selected_template,
                    "notes": "",
                    "exercises": []
                }

                if not is_blank:
                    found_routine = next((r for r in routines if r.get("name") == selected_template), None)
                    if found_routine:
                        for ex in found_routine.get("exercises", []):
                            ex_name = ex.get("name", "Ejercicio")
                            def_sets = ex.get("default_sets", 3)

                            # Buscar historial dinámico previo para sugerir pesos y reps
                            history = get_exercise_last_history(ex_name, workouts)
                            hist_sets = history.get("sets", []) if history else []

                            exercise_sets = []
                            for s_num in range(def_sets):
                                if s_num < len(hist_sets):
                                    suggested_w = float(hist_sets[s_num].get("weight", 0.0))
                                    suggested_r = int(hist_sets[s_num].get("reps", 10))
                                elif len(hist_sets) > 0:
                                    suggested_w = float(hist_sets[-1].get("weight", 0.0))
                                    suggested_r = int(hist_sets[-1].get("reps", 10))
                                else:
                                    suggested_w = 0.0
                                    suggested_r = 10

                                exercise_sets.append({
                                    "weight": suggested_w,
                                    "reps": suggested_r,
                                    "notes": ""
                                })

                            new_session["exercises"].append({
                                "name": ex_name,
                                "sets": exercise_sets
                            })
                else:
                    # Sesión en blanco: añadimos 1 ejercicio por defecto
                    new_session["exercises"].append({
                        "name": "Ejercicio 1",
                        "sets": [
                            {"weight": 0.0, "reps": 10, "notes": ""},
                            {"weight": 0.0, "reps": 10, "notes": ""},
                            {"weight": 0.0, "reps": 10, "notes": ""},
                        ]
                    })

                st.session_state.active_workout = new_session
                st.rerun()

    else:
        # HAY UNA SESIÓN EN CURSO DE REGISTRO
        session = st.session_state.active_workout
        s_id = session.get("id")

        st.markdown(f"### 📝 Registrando: {session.get('routine_name', 'Entrenamiento')}")
        st.caption(f"Fecha asignada: **{selected_date.strftime('%d/%m/%Y')}**")

        # Título y Notas de la sesión
        c_title, c_time = st.columns([3, 1])
        with c_title:
            st.text_input(
                "Título del entrenamiento:",
                value=session.get("routine_name", "Entrenamiento"),
                key=f"input_rname_{s_id}"
            )
        with c_time:
            st.text_input("Hora de inicio:", value=session.get("time", ""), disabled=True)

        st.text_area(
            "Notas / Sensaciones de la sesión:",
            value=session.get("notes", ""),
            placeholder="ej: Gran congestión, buen descanso, energía al 100%...",
            key=f"input_rnotes_{s_id}",
            height=70
        )

        st.markdown("#### Ejercicios")

        exercises = session.get("exercises", [])

        for ex_idx, ex in enumerate(exercises):
            ex_name = ex.get("name", f"Ejercicio #{ex_idx + 1}")
            ex_sets = ex.get("sets", [])

            # Buscar historial dinámico para este ejercicio
            history = get_exercise_last_history(ex_name, workouts)

            # Contenedor visual del ejercicio
            st.markdown("""<div class="exercise-card">""", unsafe_allow_html=True)

            col_ex_title, col_ex_del = st.columns([4, 1])
            with col_ex_title:
                # Permite sustituir o renombrar el ejercicio sobre la marcha
                st.text_input(
                    f"Nombre del Ejercicio #{ex_idx + 1}",
                    value=ex_name,
                    key=f"input_ex_name_{s_id}_{ex_idx}",
                    help="Puedes sustituir o renombrar este ejercicio sobre la marcha"
                )
            with col_ex_del:
                st.write("")
                if st.button("🗑️ Quitar", key=f"btn_remove_ex_{s_id}_{ex_idx}", help="Eliminar este ejercicio de la sesión"):
                    sync_active_workout_from_widgets()
                    session["exercises"].pop(ex_idx)
                    st.rerun()

            # Mostrar historial dinámico del ejercicio
            if history:
                h_date = history.get("date", "")
                try:
                    formatted_h_date = datetime.datetime.strptime(h_date, "%Y-%m-%d").strftime("%d/%m/%Y")
                except Exception:
                    formatted_h_date = h_date

                h_sets_str = " · ".join([f"S{i+1}: {s.get('weight', 0)}kg × {s.get('reps', 0)}" for i, s in enumerate(history.get("sets", []))])
                st.markdown(f"<p class='history-text'>💡 <b>Última vez ({formatted_h_date}):</b> {h_sets_str}</p>", unsafe_allow_html=True)
            else:
                st.markdown("<p class='history-text'>💡 <i>Primer registro para este ejercicio (sin historial previo)</i></p>", unsafe_allow_html=True)

            # Encabezados de las series
            h_c1, h_c2, h_c3, h_c4 = st.columns([1, 2, 2, 4])
            with h_c1:
                st.caption("Serie")
            with h_c2:
                st.caption("Peso (kg)")
            with h_c3:
                st.caption("Reps")
            with h_c4:
                st.caption("Notas / Sensaciones")

            # Filas de cada serie
            for set_idx, s in enumerate(ex_sets):
                sc1, sc2, sc3, sc4 = st.columns([1, 2, 2, 4])

                # Historial específico para esta serie si existe
                hint_w, hint_r = None, None
                if history and set_idx < len(history.get("sets", [])):
                    hint_w = history["sets"][set_idx].get("weight")
                    hint_r = history["sets"][set_idx].get("reps")

                with sc1:
                    st.write(f"**#{set_idx + 1}**")

                with sc2:
                    st.number_input(
                        f"Peso #{set_idx + 1}",
                        min_value=0.0,
                        max_value=600.0,
                        value=float(s.get("weight", 0.0)),
                        step=0.5,
                        format="%.1f",
                        key=f"w_{s_id}_{ex_idx}_{set_idx}",
                        label_visibility="collapsed"
                    )
                    if hint_w is not None:
                        st.markdown(f"<p class='hint-gray'>Ant: {hint_w} kg</p>", unsafe_allow_html=True)

                with sc3:
                    st.number_input(
                        f"Reps #{set_idx + 1}",
                        min_value=1,
                        max_value=200,
                        value=int(s.get("reps", 10)),
                        step=1,
                        key=f"r_{s_id}_{ex_idx}_{set_idx}",
                        label_visibility="collapsed"
                    )
                    if hint_r is not None:
                        st.markdown(f"<p class='hint-gray'>Ant: {hint_r} reps</p>", unsafe_allow_html=True)

                with sc4:
                    st.text_input(
                        f"Notas #{set_idx + 1}",
                        value=s.get("notes", ""),
                        placeholder="ej: RPE 8, última con pausa...",
                        key=f"n_{s_id}_{ex_idx}_{set_idx}",
                        label_visibility="collapsed"
                    )

            # Botones para añadir serie extra o quitar serie
            col_b_add, col_b_del, _ = st.columns([2, 2, 4])
            with col_b_add:
                if st.button("➕ Añadir Serie", key=f"btn_add_s_{s_id}_{ex_idx}"):
                    sync_active_workout_from_widgets()
                    last_set = ex_sets[-1] if ex_sets else {"weight": 0.0, "reps": 10, "notes": ""}
                    ex_sets.append({
                        "weight": float(last_set.get("weight", 0.0)),
                        "reps": int(last_set.get("reps", 10)),
                        "notes": ""
                    })
                    st.rerun()

            with col_b_del:
                if len(ex_sets) > 1:
                    if st.button("➖ Quitar Serie", key=f"btn_del_s_{s_id}_{ex_idx}"):
                        sync_active_workout_from_widgets()
                        ex_sets.pop()
                        st.rerun()

            st.markdown("""</div>""", unsafe_allow_html=True)

        st.write("")
        # Botón para añadir un ejercicio nuevo sobre la marcha
        if st.button("➕ Añadir Ejercicio a esta sesión", key=f"btn_add_new_ex_{s_id}"):
            sync_active_workout_from_widgets()
            session.setdefault("exercises", []).append({
                "name": f"Ejercicio {len(exercises) + 1}",
                "sets": [
                    {"weight": 0.0, "reps": 10, "notes": ""},
                    {"weight": 0.0, "reps": 10, "notes": ""},
                    {"weight": 0.0, "reps": 10, "notes": ""},
                ]
            })
            st.rerun()

        st.divider()

        # Botones finales: Guardar Sesión o Descartar
        col_btn_save, col_btn_discard = st.columns([2, 1])
        with col_btn_save:
            if st.button("💾 Guardar Sesión", type="primary", use_container_width=True):
                sync_active_workout_from_widgets()

                if not session.get("exercises"):
                    st.error("No puedes guardar una sesión sin ejercicios.")
                else:
                    # Asignar la fecha seleccionada en el date_input
                    session["date"] = selected_date_str

                    workouts.append(session)
                    save_workouts(workouts)

                    st.session_state.active_workout = None
                    st.success(f"¡Sesión '{session.get('routine_name')}' guardada correctamente! 🎉")
                    st.rerun()

        with col_btn_discard:
            if st.button("❌ Cancelar", use_container_width=True):
                st.session_state.active_workout = None
                st.info("Sesión cancelada.")
                st.rerun()
